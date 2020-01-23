import * as execSh from "exec-sh"

export default async function runCommandInteractive(command: string, params = []): Promise<string> {
    try {
        const out = await execSh.promise(command, params)
        return out.stdout || out.stderr
    } catch (e) {
        throw e.stderr || e.stdout
    }
}
