import cleanLocalBranches from "./git/cleanLocalBranches"
import getCurrentGitBranch from "./git/getCurrentGitBranch"
import runCommand from "./cmd/runCommand"
import runCommandInteractive from "./cmd/runCommandInteractive"
import * as _file from "./helpers/file"
import * as _string from "./helpers/string"
import * as _env from "./helpers/env"


export const git = {
    cleanLocalBranches,
    getCurrentGitBranch
}

export const cmd = {
    runCommand,
    runCommandInteractive
}

export const helpers = {
    file: _file,
    string: _string,
    env: _env
}
