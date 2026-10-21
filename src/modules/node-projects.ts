import { relative } from "node:path";
import type { Command } from "commander";

import {
	home,
	projectDirectory,
	removeAllowedDirectory,
} from "../lib/filesystem.js";
import {
	findNodeProjectRoots,
	findProjectCleanupDirectories,
} from "../lib/projects.js";
import { directorySize } from "../lib/size.js";
import type { CleanupModule, CleanupTarget } from "../types.js";

type NodeProjectOptions = {
	nodejsProjectDir?: string[];
	searchDepth: number;
};

export class NodeProjectsModule implements CleanupModule {
	readonly id = "node-projects";

	constructor(protected readonly program: Command) {
		program
			.addHelpText(
				"after",
				"\nSafety: Node.js project discovery is limited to supplied directories. Only selected cleanup targets can be changed.",
			)
			.option(
				"--nodejs-project-dir <path>",
				"Directory to scan for Node.js project roots; repeat for multiple directories",
				(value, previous: string[] = []) => [...previous, value],
			)
			.option(
				"--search-depth <number>",
				"Maximum directory depth to search for Node.js project roots",
				(value) => {
					const depth = Number(value);
					if (!Number.isInteger(depth) || depth < 1) {
						throw new Error("Search depth must be a positive integer.");
					}
					return depth;
				},
				5,
			);
	}

	async getTargets(): Promise<CleanupTarget[]> {
		const options = this.program.opts<NodeProjectOptions>();
		const projectDirectories = [
			...new Set(
				await Promise.all(
					(options.nodejsProjectDir ?? []).map(projectDirectory),
				),
			),
		];
		if (projectDirectories.length === 0) return [];

		const projectRoots = await findNodeProjectRoots(
			projectDirectories,
			options.searchDepth,
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
}
