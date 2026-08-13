import { join } from "node:path";

import { exists, home, removeAllowedDirectory } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupTarget } from "../types.js";

const derivedData = join(home, "Library", "Developer", "Xcode", "DerivedData");

export async function discoverXcodeTargets(): Promise<CleanupTarget[]> {
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
