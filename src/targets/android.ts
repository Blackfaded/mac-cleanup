import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { exists, home, removeAllowedDirectory } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupTarget } from "../types.js";

export async function androidTargets(): Promise<CleanupTarget[]> {
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
