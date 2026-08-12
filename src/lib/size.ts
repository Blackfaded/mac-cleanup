import { run } from "./command.js";
import { exists } from "./filesystem.js";

/** Uses macOS du output and never follows symbolic links. */
export async function directorySize(path: string): Promise<number> {
	if (!(await exists(path))) return 0;

	try {
		const output = await run("du", ["-sk", path]);
		const kilobytes = output.trim().split(/\s+/)[0];
		return kilobytes === undefined ? 0 : Number(kilobytes) * 1024;
	} catch {
		return 0;
	}
}

export function formatSize(bytes: number | undefined): string {
	if (bytes === undefined) return "size unavailable";
	if (bytes === 0) return "0 B";

	const units = ["B", "KB", "MB", "GB", "TB"];
	const unit = Math.min(
		Math.floor(Math.log(bytes) / Math.log(1024)),
		units.length - 1,
	);
	const suffix = units[unit] ?? "TB";
	return `${(bytes / 1024 ** unit).toFixed(unit === 0 ? 0 : 1)} ${suffix}`;
}
