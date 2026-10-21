import { join } from "node:path";
import type { Command } from "commander";

import { exists, home, removeAllowedDirectory } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupModule, CleanupTarget } from "../types.js";

const path = join(home, ".pulumi", "plugins");

export class PulumiModule implements CleanupModule {
	readonly id = "pulumi";

	constructor(protected readonly program: Command) {}

	async getTargets(): Promise<CleanupTarget[]> {
		if (!(await exists(path))) return [];

		return [
			{
				id: "pulumi-plugins",
				name: "Pulumi provider plugins",
				paths: [path],
				description: "Downloaded Pulumi provider plugin binaries.",
				consequence:
					"Pulumi will download needed provider versions during a later run.",
				size: () => directorySize(path),
				clean: () => removeAllowedDirectory(path),
			},
		];
	}
}
