import { relative } from "node:path";

import { home, removeAllowedDirectory } from "../lib/filesystem.js";
import {
	findNodeProjectRoots,
	findProjectCleanupDirectories,
} from "../lib/projects.js";
import { directorySize } from "../lib/size.js";
import type { CleanupTarget } from "../types.js";

export async function discoverNodeProjectTargets(
	projectDirectories: string[],
	searchDepth: number,
): Promise<CleanupTarget[]> {
	const projectRoots = await findNodeProjectRoots(
		projectDirectories,
		searchDepth,
	);

	const targets = await Promise.all(
		projectRoots.map(async (projectRoot) => {
			const paths = await findProjectCleanupDirectories(projectRoot);
			return {
				id: `node-project-${projectRoot}`,
				name: `Node.js project: ${relative(home, projectRoot)}`,
				paths,
				description:
					"Project dependencies and Nx or Turborepo caches in this project tree.",
				consequence:
					"Dependencies must be reinstalled and build caches will be recreated.",
				size: async () =>
					(await Promise.all(paths.map(directorySize))).reduce(
						(total, bytes) => total + bytes,
						0,
					),
				clean: async () => {
					for (const path of paths) await removeAllowedDirectory(path);
				},
			};
		}),
	);

	return targets.filter((target) => target.paths.length > 0);
}
