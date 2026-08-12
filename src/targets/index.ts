import type { CleanupTarget, TargetDiscovery } from "../types.js";
import { discoverAndroidTargets } from "./android.js";
import { discoverDockerTargets } from "./docker.js";
import { discoverGradleTargets } from "./gradle.js";
import { discoverNpmTargets } from "./npm.js";
import { discoverNvmTargets } from "./nvm.js";
import { discoverOllamaTargets } from "./ollama.js";
import { discoverOpenCodeTargets } from "./opencode.js";
import { discoverPnpmTargets } from "./pnpm.js";
import { discoverPulumiTargets } from "./pulumi.js";
import { discoverPuppeteerTargets } from "./puppeteer.js";
import { discoverIosSimulatorTargets, discoverXcodeTargets } from "./xcode.js";
import { discoverYarnTargets } from "./yarn.js";

export async function discoverTargets(): Promise<CleanupTarget[]> {
	const discoveries: TargetDiscovery[] = [
		discoverNpmTargets,
		discoverYarnTargets,
		discoverPnpmTargets,
		discoverGradleTargets,
		discoverXcodeTargets,
		discoverDockerTargets,
		discoverPulumiTargets,
		discoverNvmTargets,
		discoverPuppeteerTargets,
		discoverOpenCodeTargets,
		discoverAndroidTargets,
		discoverIosSimulatorTargets,
		discoverOllamaTargets,
	];

	return (await Promise.all(discoveries.map((discover) => discover()))).flat();
}
