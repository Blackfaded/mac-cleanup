import { join } from "node:path";

import { exists, home, removeAllowedDirectory } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupTarget } from "../types.js";

const path = join(home, ".gradle", "caches");

export async function discoverGradleTargets(): Promise<CleanupTarget[]> {
	if (!(await exists(path))) return [];

	return [
		{
			id: "gradle-cache",
			name: "Gradle dependency and build caches",
			paths: [path],
			description: "Cached Gradle dependencies and build outputs.",
			consequence:
				"Gradle will recreate caches and download dependencies for later builds.",
			size: () => directorySize(path),
			clean: () => removeAllowedDirectory(path),
		},
	];
}
