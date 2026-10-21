import { join } from "node:path";
import type { Command } from "commander";

import { exists, home, removeAllowedDirectory } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupModule, CleanupTarget } from "../types.js";

const path = join(home, ".cache", "puppeteer");

export class PuppeteerModule implements CleanupModule {
	readonly id = "puppeteer";

	constructor(protected readonly program: Command) {}

	async getTargets(): Promise<CleanupTarget[]> {
		if (!(await exists(path))) return [];

		return [
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
	}
}
