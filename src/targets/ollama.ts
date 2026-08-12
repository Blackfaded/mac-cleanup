import { join } from "node:path";

import { commandExists, run } from "../lib/command.js";
import { home } from "../lib/filesystem.js";
import type { CleanupTarget } from "../types.js";

function ollamaBytes(size: string): number | undefined {
	const match = /^(\d+(?:\.\d+)?)([KMGT]?B)$/i.exec(size);
	if (!match) return undefined;

	const value = match[1];
	const unit = match[2]?.toUpperCase();
	const multiplier: Record<string, number> = {
		B: 1,
		KB: 1024,
		MB: 1024 ** 2,
		GB: 1024 ** 3,
		TB: 1024 ** 4,
	};
	return value === undefined ||
		unit === undefined ||
		multiplier[unit] === undefined
		? undefined
		: Number(value) * multiplier[unit];
}

export async function ollamaTargets(): Promise<CleanupTarget[]> {
	if (!(await commandExists("ollama"))) return [];

	try {
		const output = await run("ollama", ["list"]);
		return output
			.trim()
			.split("\n")
			.slice(1)
			.flatMap<CleanupTarget>((line) => {
				const [name, , size] = line.trim().split(/\s+/);
				if (name === undefined || size === undefined || name === "") return [];

				return [
					{
						id: `ollama-${name}`,
						name: `Ollama model: ${name}`,
						paths: [join(home, ".ollama", "models")],
						description: "A locally downloaded Ollama language model.",
						consequence:
							"The model will be unavailable until downloaded again with Ollama.",
						size: async () => ollamaBytes(size),
						clean: async () => {
							await run("ollama", ["rm", name]);
						},
					},
				];
			});
	} catch {
		return [];
	}
}
