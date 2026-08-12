import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

export async function run(command: string, args: string[]): Promise<string> {
	const { stdout } = await execFile(command, args);
	return stdout;
}

export async function commandExists(command: string): Promise<boolean> {
	try {
		await run("which", [command]);
		return true;
	} catch {
		return false;
	}
}
