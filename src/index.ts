#!/usr/bin/env node

import { checkbox, confirm, input } from "@inquirer/prompts";
import { Command } from "commander";

import { availableDiskSpace } from "./lib/disk.js";
import { projectDirectory } from "./lib/filesystem.js";
import { formatSize } from "./lib/size.js";
import { discoverModules } from "./modules/index.js";
import { discoverProjectModules } from "./project_modules/index.js";
import type { CleanupTarget } from "./types.js";

async function withSizes(
	targets: CleanupTarget[],
): Promise<Array<CleanupTarget & { bytes?: number }>> {
	return Promise.all(
		targets.map(async (target) => ({
			...target,
			bytes: await target.size?.(),
		})),
	);
}

type CleanupOptions = {
	projectDir?: string[];
	searchDepth: number;
};

async function cleanup(options: CleanupOptions): Promise<void> {
	const projectDirectories = [
		...new Set(
			await Promise.all((options.projectDir ?? []).map(projectDirectory)),
		),
	];
	const targets = await withSizes(
		(
			await Promise.all([
				discoverModules(),
				discoverProjectModules(projectDirectories, options.searchDepth),
			])
		).flat(),
	);
	console.log(
		`Available disk space: ${formatSize(await availableDiskSpace())}`,
	);
	console.log(
		"\nDry run. Review the candidates before choosing anything to remove.",
	);

	if (targets.length === 0) {
		console.log("No cleanup candidates were found. Nothing was removed.");
		return;
	}

	const ids = await checkbox({
		message: "Select cleanup targets (Space selects, Enter confirms):",
		choices: targets.map((target) => ({
			name: `${target.name} (${formatSize(target.bytes)})`,
			value: target.id,
		})),
	});
	const selected = targets.filter((target) => ids.includes(target.id));
	if (selected.length === 0) {
		console.log("Nothing selected. Nothing was removed.");
		return;
	}

	console.log("\nSelected targets:");
	selected.forEach((target) => {
		console.log(`- ${target.name}: ${target.consequence}`);
	});
	const acknowledged = await confirm({
		message: "I understand these selected items will be permanently removed.",
		default: false,
	});
	if (!acknowledged) return console.log("Cancelled. Nothing was removed.");
	const confirmation = await input({
		message: "Type CLEAN to permanently remove only the selected targets:",
	});
	if (confirmation !== "CLEAN")
		return console.log("Cancelled. Nothing was removed.");

	for (const target of selected) {
		try {
			await target.clean();
			console.log(`Cleaned: ${target.name}`);
		} catch (error) {
			console.error(
				`Failed: ${target.name}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
	console.log(
		`\nAvailable disk space after cleanup: ${formatSize(await availableDiskSpace())}`,
	);
}

const program = new Command()
	.name("mac-cleanup")
	.description(
		"Conservative cleanup for macOS developer-tool caches and generated data.",
	)
	.addHelpText(
		"after",
		"\nSafety: Node.js project discovery is limited to supplied directories. Only selected cleanup targets can be changed.",
	)
	.option(
		"--project-dir <path>",
		"Directory to scan for Node.js project roots; repeat for multiple directories",
		(value, previous: string[] = []) => [...previous, value],
	)
	.option(
		"--search-depth <number>",
		"Maximum directory depth to search for Node.js project roots",
		(value) => {
			const depth = Number(value);
			if (!Number.isInteger(depth) || depth < 1) {
				throw new Error("Search depth must be a positive integer.");
			}
			return depth;
		},
		5,
	);

program.action(() => cleanup(program.opts<CleanupOptions>()));

try {
	await program.parseAsync();
} catch (error) {
	if (error instanceof Error && error.name === "ExitPromptError") {
		console.log("\nCancelled. Nothing was removed.");
	} else {
		throw error;
	}
}
