import { join } from "node:path";

import { run } from "../lib/command.js";
import { home } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupTarget } from "../types.js";

export const npmTargets: CleanupTarget[] = [
	{
		id: "npm-cache",
		name: "npm cache",
		paths: [join(home, ".npm")],
		description: "Downloaded npm packages and metadata.",
		consequence: "Packages may need to download again during a future install.",
		size: () => directorySize(join(home, ".npm")),
		clean: async () => {
			await run("npm", ["cache", "clean", "--force"]);
		},
	},
];
