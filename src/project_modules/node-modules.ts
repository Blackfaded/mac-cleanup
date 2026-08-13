import { relative } from "node:path";

import { home, removeAllowedDirectory } from "../lib/filesystem.js";
import { findProjectDirectories } from "../lib/projects.js";
import { directorySize } from "../lib/size.js";
import type { CleanupTarget } from "../types.js";

export async function discoverNodeModulesTargets(
	projectDirectories: string[],
	searchDepth: number,
): Promise<CleanupTarget[]> {
	const paths = await findProjectDirectories(
		projectDirectories,
		"node_modules",
		searchDepth,
	);

	return paths.map((path) => ({
		id: `node-modules-${path}`,
		name: `node_modules: ${relative(home, path)}`,
		paths: [path],
		description: "Installed JavaScript package dependencies for this project.",
		consequence:
			"Dependencies must be reinstalled before this project can run or build.",
		size: () => directorySize(path),
		clean: () => removeAllowedDirectory(path),
	}));
}
