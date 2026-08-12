import { join } from "node:path";

import { commandExists, run } from "../lib/command.js";
import { exists, home } from "../lib/filesystem.js";
import type { CleanupTarget } from "../types.js";

const path = join(home, "Library", "pnpm");

export async function discoverPnpmTargets(): Promise<CleanupTarget[]> {
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
