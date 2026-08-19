import type { CleanupTarget } from "../types.js";
import { discoverNodeProjectTargets } from "./node-projects.js";

export async function discoverProjectModules(
	projectDirectories: string[],
	searchDepth: number,
): Promise<CleanupTarget[]> {
	if (projectDirectories.length === 0) return [];

	return discoverNodeProjectTargets(projectDirectories, searchDepth);
}
