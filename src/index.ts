#!/usr/bin/env node

import { checkbox, confirm, input } from "@inquirer/prompts";
import { Command } from "commander";

import { availableDiskSpace } from "./lib/disk.js";
import { formatSize } from "./lib/size.js";
import { discoverTargets } from "./targets/index.js";
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

async function cleanup(): Promise<void> {
	const targets = await withSizes(await discoverTargets());
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
		"\nSafety: Downloads, Documents, projects, credentials, and system files are never scanned or changed.",
	);

program.action(cleanup);

try {
	await program.parseAsync();
} catch (error) {
	if (error instanceof Error && error.name === "ExitPromptError") {
		console.log("\nCancelled. Nothing was removed.");
	} else {
		throw error;
	}
}
