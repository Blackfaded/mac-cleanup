import { join } from "node:path";

import { home, removeAllowedDirectory } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupTarget } from "../types.js";

const path = join(home, ".cache", "opencode");

export const opencodeTargets: CleanupTarget[] = [
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
