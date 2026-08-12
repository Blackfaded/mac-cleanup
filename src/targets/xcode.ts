import { join } from "node:path";

import { commandExists, run } from "../lib/command.js";
import { exists, home, removeAllowedDirectory } from "../lib/filesystem.js";
import { directorySize } from "../lib/size.js";
import type { CleanupTarget } from "../types.js";

const derivedData = join(home, "Library", "Developer", "Xcode", "DerivedData");
const simulatorDevices = join(
	home,
	"Library",
	"Developer",
	"CoreSimulator",
	"Devices",
);

export async function discoverXcodeTargets(): Promise<CleanupTarget[]> {
	if (!(await exists(derivedData))) return [];

	return [
		{
			id: "xcode-derived-data",
			name: "Xcode DerivedData",
			paths: [derivedData],
			description: "Generated Xcode build products, indexes, and logs.",
			consequence: "Projects will rebuild and re-index when opened or built.",
			size: () => directorySize(derivedData),
			clean: () => removeAllowedDirectory(derivedData),
		},
	];
}

type SimulatorDevice = {
	isAvailable?: boolean;
	name?: string;
	udid?: string;
};

type SimctlDevices = {
	devices?: Record<string, SimulatorDevice[]>;
};

/** Lists iOS devices individually so each can be reviewed and removed independently. */
export async function discoverIosSimulatorTargets(): Promise<CleanupTarget[]> {
	if (!(await exists(simulatorDevices)) || !(await commandExists("xcrun"))) {
		return [];
	}

	try {
		const output = await run("xcrun", ["simctl", "list", "devices", "--json"]);
		const { devices = {} } = JSON.parse(output) as SimctlDevices;

		return Object.entries(devices).flatMap(([runtime, simulators]) => {
			if (!runtime.includes(".iOS-")) return [];

			return simulators.flatMap((simulator) => {
				if (!simulator.name || !simulator.udid) return [];

				const { name, udid } = simulator;
				const path = join(simulatorDevices, udid);
				const availability =
					simulator.isAvailable === false ? "unavailable" : "available";
				return [
					{
						id: `ios-simulator-${udid}`,
						name: `iOS simulator (${availability}): ${name}`,
						paths: [path],
						description: "An individually selectable iOS simulator device.",
						consequence: "This simulator device will be permanently removed.",
						size: () => directorySize(path),
						clean: async () => {
							await run("xcrun", ["simctl", "delete", udid]);
						},
					},
				];
			});
		});
	} catch {
		return [];
	}
}
