import { commandExists } from "../lib/command.js";
import { exists } from "../lib/filesystem.js";
import type { CleanupTarget } from "../types.js";
import { androidTargets } from "./android.js";
import { dockerTargets } from "./docker.js";
import { gradleTargets } from "./gradle.js";
import { npmTargets } from "./npm.js";
import { nvmTargets } from "./nvm.js";
import { ollamaTargets } from "./ollama.js";
import { opencodeTargets } from "./opencode.js";
import { pnpmTargets } from "./pnpm.js";
import { pulumiTargets } from "./pulumi.js";
import { puppeteerTargets } from "./puppeteer.js";
import { iosSimulatorTargets, xcodeTargets } from "./xcode.js";
import { yarnTargets } from "./yarn.js";

export async function discoverTargets(): Promise<CleanupTarget[]> {
	const commands: Record<string, string> = {
		"npm-cache": "npm",
		"yarn-cache": "yarn",
		"pnpm-store": "pnpm",
		"docker-build-cache": "docker",
		"docker-dangling-images": "docker",
	};
	const candidates = [
		...npmTargets,
		...yarnTargets,
		...pnpmTargets,
		...gradleTargets,
		...xcodeTargets,
		...dockerTargets,
		...pulumiTargets,
		...nvmTargets,
		...puppeteerTargets,
		...opencodeTargets,
		...(await androidTargets()),
		...(await iosSimulatorTargets()),
		...(await ollamaTargets()),
	];
	const available: CleanupTarget[] = [];

	for (const target of candidates) {
		if (!(await Promise.all(target.paths.map(exists))).some(Boolean)) continue;
		const command = target.id.startsWith("ios-simulator-")
			? "xcrun"
			: commands[target.id];
		if (command && !(await commandExists(command))) continue;
		available.push(target);
	}
	return available;
}
