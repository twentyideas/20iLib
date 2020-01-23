import lodash from "lodash"
import runCommand from "../cmd/runCommand"
import getCurrentGitBranch from "./getCurrentGitBranch"
import { getEnvVars } from "../helpers/env"

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined
}

export default async function cleanLocalBranches() {
    const allBranches = await runCommand("git branch -a")
    const currentBranch = await getCurrentGitBranch()

    const branchesClean = allBranches
        .split("\n")
        .map(branch => (branch.startsWith("*") ? branch.slice(2) : branch))
        .map(lodash.trim)
        .filter(Boolean)

    const remoteBranches = branchesClean
        .filter(branch => branch.startsWith("remotes/"))
        .map(branch => lodash.last(branch.split("->").map(lodash.trim)))
        .filter(notEmpty)
        .map(branch => lodash.last(branch.split("/")))

    const safeBranches = lodash.uniq(["master", currentBranch, ...remoteBranches])

    const localBranches = branchesClean.filter(branch => !branch.startsWith("remotes/"))
    const branchesToDelete = localBranches.filter(branch => !safeBranches.includes(branch))

    console.log(`Removing branches...`, branchesToDelete)
    await Promise.all(branchesToDelete.map(branch => runCommand(`git branch -d -f ${branch}`)))
    console.log(`Done!`)

    console.log(`Removing local tags`)
    runCommand(`git tag -l`)
        .split("\n")
        .filter(Boolean)
        .forEach(tag => runCommand(`git tag -d ${tag}`))

    console.log(`Fetching remote tags`)
    runCommand(`git fetch -t`)
}

if (getEnvVars().run) {
    cleanLocalBranches()
}
