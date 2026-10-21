import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Command } from "commander";

import { exists, home, removeAllowedDirectory } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupModule, CleanupTarget } from "../types.js";

export class AndroidModule implements CleanupModule {
	readonly id = "android";

	constructor(protected readonly program: Command) {}

	async getTargets(): Promise<CleanupTarget[]> {
		const directory = join(home, ".android", "avd");
		if (!(await exists(directory))) return [];

		return (await readdir(directory, { withFileTypes: true }))
			.filter((entry) => entry.isDirectory() && entry.name.endsWith(".avd"))
			.map((entry) => {
				const name = entry.name.slice(0, -4);
				const path = join(directory, entry.name);
				return {
					id: `android-avd-${name}`,
					name: `Android virtual device: ${name}`,
					paths: [path],
					description: "A complete Android emulator device image.",
					consequence: "This emulator device will be permanently removed.",
					size: () => directorySize(path),
					clean: () => removeAllowedDirectory(path),
				};
			});
	}
}
