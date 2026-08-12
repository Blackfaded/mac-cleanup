import { join } from "node:path";

import { run } from "../lib/command.js";
import { home } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupTarget } from "../types.js";

export const yarnTargets: CleanupTarget[] = [
	{
		id: "yarn-cache",
		name: "Yarn cache",
		paths: [join(home, "Library", "Caches", "Yarn")],
		description: "Downloaded Yarn packages and metadata.",
		consequence: "Packages may need to download again during a future install.",
		size: () => directorySize(join(home, "Library", "Caches", "Yarn")),
		clean: async () => {
			await run("yarn", ["cache", "clean"]);
		},
	},
];
