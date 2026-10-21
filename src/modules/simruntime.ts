import type { Command } from "commander";

import { commandExists, run } from "../lib/command.js";
import type { CleanupModule, CleanupTarget } from "../types.js";

type SimulatorRuntimeImage = {
	build?: string;
	identifier?: string;
	mountPath?: string;
	sizeBytes?: number;
	version?: string;
};

type SimctlRuntimeImages = Record<string, SimulatorRuntimeImage>;

export class IosSimulatorRuntimeModule implements CleanupModule {
	readonly id = "simruntime";

	constructor(protected readonly program: Command) {}

	/** Lists installed runtime images independently from their simulator devices. */
	async getTargets(): Promise<CleanupTarget[]> {
		if (!(await commandExists("xcrun"))) return [];

		try {
			const output = await run("xcrun", [
				"simctl",
				"runtime",
				"list",
				"--json",
			]);
			const runtimes = JSON.parse(output) as SimctlRuntimeImages;

			return Object.entries(runtimes).flatMap(([imageId, runtime]) => {
				if (!runtime.identifier || !runtime.version || !runtime.mountPath)
					return [];

				const build = runtime.build ? ` (${runtime.build})` : "";
				return [
					{
						id: `ios-simulator-runtime-${imageId}`,
						name: `iOS simulator runtime: iOS ${runtime.version}${build}`,
						paths: [runtime.mountPath],
						description: "An installed iOS simulator runtime image.",
						consequence:
							"Simulator devices that use this runtime will no longer run and must be deleted separately.",
						size: async () => runtime.sizeBytes,
						clean: async () => {
							await run("xcrun", ["simctl", "runtime", "delete", imageId]);
						},
					},
				];
			});
		} catch {
			return [];
		}
	}
}
