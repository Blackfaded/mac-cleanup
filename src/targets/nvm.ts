import { join } from "node:path";

import { home, removeAllowedDirectory } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupTarget } from "../types.js";

const path = join(home, ".nvm", "cache");

export const nvmTargets: CleanupTarget[] = [
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
