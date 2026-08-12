import { run } from "./command.js";
import { home } from "./filesystem.js";

export async function availableDiskSpace(): Promise<number | undefined> {
	try {
		const output = await run("df", ["-k", home]);
		const fields = output.trim().split("\n").at(-1)?.trim().split(/\s+/);
		const availableKilobytes = fields?.[3];
		return availableKilobytes === undefined
			? undefined
			: Number(availableKilobytes) * 1024;
	} catch {
		return undefined;
	}
}
