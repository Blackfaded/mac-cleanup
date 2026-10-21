import { join } from "node:path";
import type { Command } from "commander";

import { exists, home, removeAllowedDirectory } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupModule, CleanupTarget } from "../types.js";

const derivedData = join(home, "Library", "Developer", "Xcode", "DerivedData");

export class XcodeModule implements CleanupModule {
	readonly id = "xcode";

	constructor(protected readonly program: Command) {}

	async getTargets(): Promise<CleanupTarget[]> {
		if (!(await exists(derivedData))) return [];

		return [
			{
				id: "xcode-derived-data",
				name: "Xcode DerivedData",
				paths: [derivedData],
				description: "Generated Xcode build products, indexes, and logs.",
				consequence: "Projects will rebuild and re-index when opened or built.",
				size: () => directorySize(derivedData),
				clean: () => removeAllowedDirectory(derivedData),
			},
		];
	}
}
