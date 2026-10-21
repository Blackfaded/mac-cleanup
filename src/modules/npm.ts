import { join } from "node:path";
import type { Command } from "commander";

import { commandExists, run } from "../lib/command.js";
import { exists, home } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupModule, CleanupTarget } from "../types.js";

const path = join(home, ".npm");

export class NpmModule implements CleanupModule {
	readonly id = "npm";

	constructor(protected readonly program: Command) {}

	async getTargets(): Promise<CleanupTarget[]> {
		if (!(await exists(path)) || !(await commandExists("npm"))) return [];

		return [
			{
				id: "npm-cache",
				name: "npm cache",
				paths: [path],
				description: "Downloaded npm packages and metadata.",
				consequence:
					"Packages may need to download again during a future install.",
				size: () => directorySize(path),
				clean: async () => {
					await run("npm", ["cache", "clean", "--force"]);
				},
			},
		];
	}
}
