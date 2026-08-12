import { join } from "node:path";

import { home, removeAllowedDirectory } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupTarget } from "../types.js";

const path = join(home, ".cache", "puppeteer");

export const puppeteerTargets: CleanupTarget[] = [
	{
		id: "puppeteer-cache",
		name: "Puppeteer browser cache",
		paths: [path],
		description: "Browsers downloaded by Puppeteer for automated tests.",
		consequence: "Puppeteer will download required browsers again.",
		size: () => directorySize(path),
		clean: () => removeAllowedDirectory(path),
	},
];
