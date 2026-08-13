import { discoverProjectCacheTargets } from "./cache.js";

export function discoverTurboTargets(
	projectDirectories: string[],
	searchDepth: number,
) {
	return discoverProjectCacheTargets(projectDirectories, searchDepth, {
		id: "turbo-cache",
		markerDirectory: ".turbo",
		name: "Turborepo cache",
		description: "Cached Turborepo task results.",
		consequence:
			"Turborepo will recreate cached task results during later commands.",
	});
}
