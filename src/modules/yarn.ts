import { join } from "node:path";
import type { Command } from "commander";

import { commandExists, run } from "../lib/command.js";
import { exists, home } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupModule, CleanupTarget } from "../types.js";

const path = join(home, "Library", "Caches", "Yarn");

export class YarnModule implements CleanupModule {
	readonly id = "yarn";

	constructor(protected readonly program: Command) {}

	async getTargets(): Promise<CleanupTarget[]> {
		if (!(await exists(path)) || !(await commandExists("yarn"))) return [];

		return [
			{
				id: "yarn-cache",
				name: "Yarn cache",
				paths: [path],
				description: "Downloaded Yarn packages and metadata.",
				consequence:
					"Packages may need to download again during a future install.",
				size: () => directorySize(path),
				clean: async () => {
					await run("yarn", ["cache", "clean"]);
				},
			},
		];
	}
}
