import { join } from "node:path";

import { run } from "../lib/command.js";
import { home } from "../lib/filesystem.js";
import type { CleanupTarget } from "../types.js";

export const pnpmTargets: CleanupTarget[] = [
	{
		id: "pnpm-store",
		name: "pnpm unreferenced store packages",
		paths: [join(home, "Library", "pnpm")],
		description:
			"Packages in the pnpm store that no current project references.",
		consequence:
			"Only unreferenced packages are removed; pnpm may download them later.",
		clean: async () => {
			await run("pnpm", ["store", "prune"]);
		},
	},
];
