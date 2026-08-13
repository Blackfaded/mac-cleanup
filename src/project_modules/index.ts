import type { CleanupTarget, TargetDiscovery } from "../types.js";
import { discoverNodeModulesTargets } from "./node-modules.js";
import { discoverNxTargets } from "./nx.js";
import { discoverTurboTargets } from "./turbo.js";

export async function discoverProjectModules(
	projectDirectories: string[],
	searchDepth: number,
): Promise<CleanupTarget[]> {
	if (projectDirectories.length === 0) return [];

	const discoveries: TargetDiscovery[] = [
		() => discoverNodeModulesTargets(projectDirectories, searchDepth),
		() => discoverNxTargets(projectDirectories, searchDepth),
		() => discoverTurboTargets(projectDirectories, searchDepth),
	];

	return (await Promise.all(discoveries.map((discover) => discover()))).flat();
}
