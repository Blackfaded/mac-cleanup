import { join } from "node:path";

import { run } from "../lib/command.js";
import { home } from "../lib/filesystem.js";
import type { CleanupTarget } from "../types.js";

const dockerData = join(home, "Library", "Containers", "com.docker.docker");

export const dockerTargets: CleanupTarget[] = [
	{
		id: "docker-build-cache",
		name: "Docker build cache",
		paths: [dockerData],
		description: "Unused Docker build layers.",
		consequence:
			"Docker rebuilds may take longer. Images, containers, and volumes remain.",
		clean: async () => {
			await run("docker", ["builder", "prune", "--force"]);
		},
	},
	{
		id: "docker-dangling-images",
		name: "Docker dangling images",
		paths: [dockerData],
		description: "Docker image layers no longer tagged or used by a container.",
		consequence: "Tagged images, containers, and volumes remain.",
		clean: async () => {
			await run("docker", ["image", "prune", "--force"]);
		},
	},
];
