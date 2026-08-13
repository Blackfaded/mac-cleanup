import { readdir } from "node:fs/promises";
import { join } from "node:path";

/** Finds matching directories without following symbolic links or entering matches. */
export async function findProjectDirectories(
	roots: string[],
	name: string,
	maxDepth: number,
): Promise<string[]> {
	const matches: string[] = [];
	const directories = roots.map((path) => ({ path, depth: 0 }));

	while (directories.length > 0) {
		const directory = directories.shift();
		if (!directory) continue;

		try {
			const entries = await readdir(directory.path, { withFileTypes: true });
			for (const entry of entries) {
				if (!entry.isDirectory() || entry.isSymbolicLink()) continue;

				const path = join(directory.path, entry.name);
				if (entry.name === name) {
					matches.push(path);
					continue;
				}
				if (directory.depth < maxDepth - 1) {
					directories.push({ path, depth: directory.depth + 1 });
				}
			}
		} catch {
			// Ignore directories which cannot be read while scanning user-selected roots.
		}
	}

	return matches.sort();
}
