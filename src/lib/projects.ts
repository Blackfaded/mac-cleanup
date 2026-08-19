import { lstat, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const ignoredDirectories = new Set([".git", "node_modules"]);

/** Finds outermost Node.js projects without entering Git metadata or dependencies. */
export async function findNodeProjectRoots(
	roots: string[],
	maxDepth: number,
): Promise<string[]> {
	const projects: string[] = [];
	const directories = roots.map((path) => ({ path, depth: 0 }));

	while (directories.length > 0) {
		const directory = directories.shift();
		if (!directory) continue;

		try {
			const entries = await readdir(directory.path, { withFileTypes: true });
			if (
				entries.some((entry) => entry.name === "package.json" && entry.isFile())
			) {
				projects.push(directory.path);
			}
			for (const entry of entries) {
				if (
					!entry.isDirectory() ||
					entry.isSymbolicLink() ||
					ignoredDirectories.has(entry.name)
				)
					continue;

				const path = join(directory.path, entry.name);
				if (directory.depth < maxDepth) {
					directories.push({ path, depth: directory.depth + 1 });
				}
			}
		} catch {
			// Ignore directories which cannot be read while scanning user-selected roots.
		}
	}

	return [...new Set(projects)]
		.sort(
			(left, right) => left.length - right.length || left.localeCompare(right),
		)
		.filter(
			(project, index, sortedProjects) =>
				!sortedProjects
					.slice(0, index)
					.some((root) => isDescendant(project, root)),
		);
}

/** Finds supported cleanup directories anywhere below a selected project root. */
export async function findProjectCleanupDirectories(
	projectRoot: string,
): Promise<string[]> {
	const paths: string[] = [];
	const directories = [projectRoot];

	while (directories.length > 0) {
		const directory = directories.shift();
		if (!directory) continue;

		try {
			const entries = await readdir(directory, { withFileTypes: true });
			for (const entry of entries) {
				if (!entry.isDirectory() || entry.isSymbolicLink()) continue;

				const path = join(directory, entry.name);
				if (entry.name === "node_modules") {
					paths.push(path);
					continue;
				}
				if (entry.name === ".nx" || entry.name === ".turbo") {
					const cache = join(path, "cache");
					try {
						const stats = await lstat(cache);
						if (stats.isDirectory() && !stats.isSymbolicLink())
							paths.push(cache);
					} catch {
						// The marker directory has no cache to clean.
					}
					continue;
				}
				if (!ignoredDirectories.has(entry.name)) directories.push(path);
			}
		} catch {
			// Ignore directories which cannot be read while scanning user-selected roots.
		}
	}

	return paths.sort();
}

function isDescendant(path: string, root: string): boolean {
	const pathFromRoot = relative(root, path);
	return (
		pathFromRoot !== "" &&
		pathFromRoot !== ".." &&
		!pathFromRoot.startsWith("../")
	);
}
