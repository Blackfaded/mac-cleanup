#!/usr/bin/env node

import { createRequire } from "node:module";
import { checkbox, confirm, input } from "@inquirer/prompts";
import { Command } from "commander";

import { availableDiskSpace } from "./lib/disk.js";
import { formatSize } from "./lib/size.js";
import { AndroidModule } from "./modules/android.js";
import { DockerModule } from "./modules/docker.js";
import { GradleModule } from "./modules/gradle.js";
import { NodeProjectsModule } from "./modules/node-projects.js";
import { NpmModule } from "./modules/npm.js";
import { NvmModule } from "./modules/nvm.js";
import { OllamaModule } from "./modules/ollama.js";
import { OpenCodeModule } from "./modules/opencode.js";
import { PnpmModule } from "./modules/pnpm.js";
import { PulumiModule } from "./modules/pulumi.js";
import { PuppeteerModule } from "./modules/puppeteer.js";
import { IosSimulatorRuntimeModule } from "./modules/simruntime.js";
import { IosSimulatorModule } from "./modules/simtarget.js";
import { XcodeModule } from "./modules/xcode.js";
import { YarnModule } from "./modules/yarn.js";
import type { CleanupModule } from "./types.js";

const { version }: { version: string } = createRequire(import.meta.url)(
	"../package.json",
);

const program = new Command()
	.name("mac-cleanup")
	.version(version)
	.description(
		"Conservative cleanup for macOS developer-tool caches and generated data.",
	);

const modules: CleanupModule[] = [
	new NpmModule(program),
	new YarnModule(program),
	new PnpmModule(program),
	new GradleModule(program),
	new XcodeModule(program),
	new DockerModule(program),
	new PulumiModule(program),
	new NvmModule(program),
	new PuppeteerModule(program),
	new OpenCodeModule(program),
	new AndroidModule(program),
	new IosSimulatorModule(program),
	new IosSimulatorRuntimeModule(program),
	new OllamaModule(program),
	new NodeProjectsModule(program),
];

async function cleanup(): Promise<void> {
	const targets = (
		await Promise.all(
			modules.map(async (module) => {
				const targets = await module.getTargets();
				return Promise.all(
					targets.map(async (target) => ({
						...target,
						bytes: await target.size?.(),
					})),
				);
			}),
		)
	).flat();

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

try {
	program.action(cleanup);
	await program.parseAsync();
} catch (error) {
	if (error instanceof Error && error.name === "ExitPromptError") {
		console.log("\nCancelled. Nothing was removed.");
	} else {
		throw error;
	}
}
