import { join } from "node:path";
import type { Command } from "commander";

import { commandExists, run } from "../lib/command.js";
import { exists, home } from "../lib/filesystem.js";
import type { CleanupModule, CleanupTarget } from "../types.js";

const path = join(home, "Library", "pnpm");

export class PnpmModule implements CleanupModule {
	readonly id = "pnpm";

	constructor(protected readonly program: Command) {}

	async getTargets(): Promise<CleanupTarget[]> {
		if (!(await exists(path)) || !(await commandExists("pnpm"))) return [];

		return [
			{
				id: "pnpm-store",
				name: "pnpm unreferenced store packages",
				paths: [path],
				description:
					"Packages in the pnpm store that no current project references.",
				consequence:
					"Only unreferenced packages are removed; pnpm may download them later.",
				clean: async () => {
					await run("pnpm", ["store", "prune"]);
				},
			},
		];
	}
}
