import { constants } from "node:fs";
import { access, lstat, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { relative, resolve } from "node:path";

export const home = homedir();

export async function exists(path: string): Promise<boolean> {
	try {
		await access(path, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

/** Only removes explicit cache paths below the current user's home directory. */
export async function removeAllowedDirectory(path: string): Promise<void> {
	const resolvedHome = resolve(home);
	const resolvedPath = resolve(path);
	const pathFromHome = relative(resolvedHome, resolvedPath);
	if (
		pathFromHome === "" ||
		pathFromHome === ".." ||
		pathFromHome.startsWith("../")
	) {
		throw new Error(
			`Refusing to remove a path outside the home directory: ${path}`,
		);
	}

	const stats = await lstat(resolvedPath);
	if (!stats.isDirectory() || stats.isSymbolicLink()) {
		throw new Error(
			`Refusing to remove a non-directory or symbolic link: ${path}`,
		);
	}

	await rm(resolvedPath, { force: false, recursive: true });
}
