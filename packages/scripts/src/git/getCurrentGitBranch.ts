import lodash from "lodash"
import runCommand from "../cmd/runCommand"
import { getEnvVars } from "../helpers/env"

export default function getCurrentGitBranch() {
    const branches = runCommand("git branch")
    const [current] = branches
        .split("\n")
        .map(lodash.trim)
        .filter(branch => branch.startsWith("*"))
    return current.slice(2)
}

if (getEnvVars().run) {
    getCurrentGitBranch()
}