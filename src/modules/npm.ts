import { join } from "node:path";

import { commandExists, run } from "../lib/command.js";
import { exists, home } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupTarget } from "../types.js";

const path = join(home, ".npm");

export async function discoverNpmTargets(): Promise<CleanupTarget[]> {
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
