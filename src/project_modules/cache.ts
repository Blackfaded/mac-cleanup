import { lstat } from "node:fs/promises";
import { join, relative } from "node:path";

import { home, removeAllowedDirectory } from "../lib/filesystem.js";
import { findProjectDirectories } from "../lib/projects.js";
import { directorySize } from "../lib/size.js";
import type { CleanupTarget } from "../types.js";

type ProjectCache = {
	id: string;
	markerDirectory: string;
	name: string;
	description: string;
	consequence: string;
};

export async function discoverProjectCacheTargets(
	projectDirectories: string[],
	searchDepth: number,
	cache: ProjectCache,
): Promise<CleanupTarget[]> {
	const markers = await findProjectDirectories(
		projectDirectories,
		cache.markerDirectory,
		searchDepth,
	);
	const paths = (
		await Promise.all(
			markers.map(async (marker) => {
				const path = join(marker, "cache");
				try {
					const stats = await lstat(path);
					return stats.isDirectory() && !stats.isSymbolicLink()
						? path
						: undefined;
				} catch {
					return undefined;
				}
			}),
		)
	).flatMap((path) => (path === undefined ? [] : [path]));

	return paths.map((path) => ({
		id: `${cache.id}-${path}`,
		name: `${cache.name}: ${relative(home, path)}`,
		paths: [path],
		description: cache.description,
		consequence: cache.consequence,
		size: () => directorySize(path),
		clean: () => removeAllowedDirectory(path),
	}));
}
