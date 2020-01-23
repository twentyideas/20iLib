import shell, { ExecOptions } from "shelljs"

export default function runCommand(command: string, options: ExecOptions = { silent: true }) {
    const { code, stderr, stdout } = shell.exec(command, options) as shell.ShellString
    if (code !== 0) {
        throw stderr || stdout
    }
    return stdout
}
