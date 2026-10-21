import { join } from "node:path";
import type { Command } from "commander";

import { exists, home, removeAllowedDirectory } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupModule, CleanupTarget } from "../types.js";

const path = join(home, ".nvm", "cache");

export class NvmModule implements CleanupModule {
	readonly id = "nvm";

	constructor(protected readonly program: Command) {}

	async getTargets(): Promise<CleanupTarget[]> {
		if (!(await exists(path))) return [];

		return [
			{
				id: "nvm-cache",
				name: "nvm download cache",
				paths: [path],
				description: "Node.js installer archives downloaded by nvm.",
				consequence:
					"Installed Node.js versions remain; future installs may download archives again.",
				size: () => directorySize(path),
				clean: () => removeAllowedDirectory(path),
			},
		];
	}
}
