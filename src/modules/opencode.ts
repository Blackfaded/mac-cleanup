import { join } from "node:path";
import type { Command } from "commander";

import { exists, home, removeAllowedDirectory } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupModule, CleanupTarget } from "../types.js";

const path = join(home, ".cache", "opencode");

export class OpenCodeModule implements CleanupModule {
	readonly id = "opencode";

	constructor(protected readonly program: Command) {}

	async getTargets(): Promise<CleanupTarget[]> {
		if (!(await exists(path))) return [];

		return [
			{
				id: "opencode-cache",
				name: "OpenCode cache",
				paths: [path],
				description: "Cached OpenCode runtime data.",
				consequence: "OpenCode recreates cached data when needed.",
				size: () => directorySize(path),
				clean: () => removeAllowedDirectory(path),
			},
		];
	}
}
