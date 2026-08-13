import { discoverProjectCacheTargets } from "./cache.js";

export function discoverNxTargets(
	projectDirectories: string[],
	searchDepth: number,
) {
	return discoverProjectCacheTargets(projectDirectories, searchDepth, {
		id: "nx-cache",
		markerDirectory: ".nx",
		name: "Nx cache",
		description: "Cached Nx task results and workspace data.",
		consequence: "Nx will recreate cached task results during later commands.",
	});
}
