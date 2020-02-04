import lodash from "lodash"
import * as path from "path"
import * as scripts from "@20i/scripts"
import inquirer from "inquirer"
import EnvPaths from "env-paths"
import AdmZip from "adm-zip"
import fs from "fs"

enum ReleaseType {
    PATCH = "patch",
    MINOR = "minor",
    MAJOR = "major",
    NONE = "none"
}

interface InquirerAnswers {
    chosenRemoteIds: string[]
    releaseType: ReleaseType
}

interface DeployParams {
    remoteIds: string[]
    projectName: string

    buildRoot: string
    buildDirs: string[]
    buildFiles: string[]

    packageJsons?: string[]
}

interface CreateDeployParams {
    projectName: string
    buildRoot: string
    buildDirs: string[]
    buildFiles: string[]
    version: string
}

const { runCommand } = scripts.cmd

// use this to get system temp path
const ENV_PATH = EnvPaths("heroku-deploy-node-build")

const PATHS = {
    build: {
        extractionScript: path.resolve(__dirname, "extractDeployment.js")
    },
    deploy: {
        root: ENV_PATH.temp,
        zip: path.resolve(ENV_PATH.temp, "out.zip"),
        extractionScript: path.resolve(ENV_PATH.temp, "extractDeployment.js"),
        packageJson: path.resolve(ENV_PATH.temp, "package.json")
    }
}

const helpers = {
    heroku: {
        addGitEnv(remoteId: string) {
            if (!remoteId) {
                throw new Error(`Missing params: ${JSON.stringify({ remoteId })}`)
            }
            runCommand(`heroku git:remote -a ${remoteId} -r ${remoteId}`)
        },
        removeGitEnv(remoteId: string) {
            if (!remoteId) {
                throw new Error(`Missing params: ${JSON.stringify({ remoteId })}`)
            }
            runCommand(`git remote rm ${remoteId}`)
        },
        push(remoteId: string, buildBranch: string) {
            if (!remoteId || !buildBranch) {
                throw new Error(`Missing params: ${JSON.stringify({ remoteId, buildBranch })}`)
            }

            console.log(`Now pushing to heroku... ${remoteId}`)
            runCommand(`git push ${remoteId} ${buildBranch}:master --force`)
        },
        deploy(remoteIds: string[]) {
            const cwd = process.cwd()

            process.chdir(PATHS.deploy.root)
            runCommand("git init")

            remoteIds.forEach(remoteId => {
                console.log(`Deploying ${remoteId}...`)
                helpers.heroku.addGitEnv(remoteId)
                helpers.git.commit()
                helpers.heroku.push(remoteId, "master")
                console.log(`Finished`)
                helpers.heroku.removeGitEnv(remoteId)
            })

            process.chdir(cwd)
        }
    },
    files: {
        createDeployFolder({ projectName, buildFiles: files, buildDirs: folders, buildRoot: root, version }: CreateDeployParams) {
            console.log(`Build folder: ${PATHS.deploy.root}`)
            console.log("Cleaning previous build (if any)...")
            if (scripts.helpers.file.dirExists(PATHS.deploy.root)) {
                scripts.helpers.file.removeDir(PATHS.deploy.root)
            }

            console.log("Creating folder...")
            scripts.helpers.file.createDir(PATHS.deploy.root)

            // isolate the build
            console.log("Creating build zip...")
            const zip = new AdmZip()
            folders.forEach(folder => {
                const relativePath = path.relative(root, folder)
                zip.addLocalFolder(folder, relativePath)
            })
            files.forEach(file => {
                const fileFolder = file
                    .split(path.sep)
                    .slice(0, -1)
                    .join(path.sep)
                const relativePath = path.relative(root, fileFolder)

                // if this is a package.json, update the version number to the new one
                const fileName = file.split(path.sep).slice(-1)[0]
                if (fileName === "package.json") {
                    try {
                        const packageJson = JSON.parse(fs.readFileSync(file, { encoding: "utf8" }))
                        packageJson.version = version
                        const stringified = JSON.stringify(packageJson, null, 4)
                        const p = [relativePath, fileName].filter(Boolean).join(path.sep)
                        console.log(`Build:: Incrementing ${p} version to ${version}...`)
                        zip.addFile(p, Buffer.alloc(stringified.length, stringified), stringified)
                        console.log(`Build:: Incremented ${p} version to ${version}`)
                    } catch (e) {
                        console.error("Unable to increment package.json version. Adding file as is")
                        zip.addLocalFile(file, relativePath)
                    }
                } else {
                    zip.addLocalFile(file, relativePath)
                }
            })

            zip.writeZip(PATHS.deploy.zip)

            console.log("copying extraction script to temp deploy folder...")
            scripts.helpers.file.copyFile(PATHS.build.extractionScript, PATHS.deploy.extractionScript)

            // console.log("Writing package.json for build...")
            scripts.helpers.file.writeFile({
                dest: PATHS.deploy.packageJson,
                data: JSON.stringify(
                    {
                        name: projectName,
                        version,
                        private: true,
                        engines: {
                            node: "12.13.0"
                        },
                        dependencies: {
                            "adm-zip": "^0.4.13"
                        },
                        scripts: {
                            // rebuild packages that need it!!
                            build: "node extractDeployment && cd out && npm rebuild",
                            start: "cd out && npm run start"
                        }
                    },
                    null,
                    4
                )
            })
        },
        updatePackageJsonVersionNumbers(verisonNumber: string, packageJsonPaths: string[]) {
            packageJsonPaths.forEach(filePath => {
                const file = JSON.parse(scripts.helpers.file.readFile(filePath))
                file.version = verisonNumber
                scripts.helpers.file.writeFile({ dest: filePath, data: JSON.stringify(file, null, 4) })
            })
        },
        getCurrentVersion(buildRoot: string) {
            const json = JSON.parse(scripts.helpers.file.readFile(path.resolve(buildRoot, "package.json")))
            return json.version
        },
        getNewVersion(buildRoot: string, releaseType: ReleaseType) {
            const [major, minor, patch] = helpers.files
                .getCurrentVersion(buildRoot)
                .split(".")
                .map(lodash.toNumber)
            switch (releaseType) {
                case ReleaseType.MAJOR:
                    return [major + 1, 0, 0].join(".")
                case ReleaseType.MINOR:
                    return [major, minor + 1, 0].join(".")
                case ReleaseType.PATCH:
                    return [major, minor, patch + 1].join(".")
                default:
                    throw new Error(`Incorrect release type: ${releaseType}`)
            }
        }
    },
    git: {
        commit(commitMsg?: string) {
            console.log(`Comitting...`)
            runCommand(`git add -A`)
            runCommand(`git commit -m "${commitMsg || "Prepare-build-branch"}" -n`)
        },
        addTagAndPush(verisonNumber: string) {
            runCommand(`git tag -a ${verisonNumber} -m "v${verisonNumber}"`)
            runCommand(`git push --follow-tags`)
        },
        generateReleaseNotes(versionNumber?: string) {
            try {
                if (!versionNumber) {
                    runCommand(`gren release --tags=${versionNumber} --override --data-source=commits`, { env: process.env })
                } else {
                    runCommand(`gren release --tags=all --override --data-source=commits`, { env: process.env })
                }
            } catch (e) {
                console.log("Make sure that github-release-notes is installed: https://www.npmjs.com/package/github-release-notes")
                console.error(e)
            }
        }
    },
    ToInqurierAnswers(answers: Partial<InquirerAnswers>): InquirerAnswers {
        return {
            chosenRemoteIds: [],
            releaseType: ReleaseType.NONE,
            ...answers
        }
    }
}

export async function herokuDeployNode({ remoteIds, projectName, buildDirs, buildFiles, buildRoot, packageJsons }: DeployParams): Promise<string[]> {
    if (!remoteIds.length) {
        console.log("Please provide heroku remoteIds to deploy")
        return []
    }

    const answers = await inquirer.prompt([
        {
            type: "checkbox",
            name: "chosenRemoteIds",
            choices: remoteIds,
            message: "Where would you like to deploy?",
            default: (): string[] => []
        },
        {
            type: "list",
            name: "releaseType",
            choices: lodash.values(ReleaseType),
            message: "What type of depoy is this?",
            default: ReleaseType.PATCH
        }
    ])

    const { chosenRemoteIds, releaseType } = helpers.ToInqurierAnswers(answers)
    if (!chosenRemoteIds.length) {
        console.log("Exiting early because no remote chosen")
        return []
    }

    const newVersion = releaseType !== ReleaseType.NONE ? helpers.files.getNewVersion(buildRoot, releaseType) : ""

    // Copy over only the files needed to run this thing! Node_modules copy will take a while!
    console.log("Setting up temp deploy folder...")
    helpers.files.createDeployFolder({
        projectName,
        buildRoot,
        buildDirs,
        buildFiles,
        version: newVersion || helpers.files.getCurrentVersion(buildRoot)
    })

    // do deploys!!
    console.log("Deploying...")
    helpers.heroku.deploy(chosenRemoteIds)

    if (newVersion && (!packageJsons || !packageJsons.length)) {
        console.log("If you include package.jsons in the params, we can autoupdate them & git tag/push")
    }

    if (newVersion && packageJsons && packageJsons.length) {
        helpers.files.updatePackageJsonVersionNumbers(newVersion, packageJsons)
        helpers.git.commit()
        helpers.git.addTagAndPush(newVersion)
        helpers.git.generateReleaseNotes(newVersion)
        console.log(`Finished deploying ${newVersion} to`, chosenRemoteIds)
    } else {
        console.log(`Finished deploying ${newVersion || helpers.files.getCurrentVersion(buildRoot)} to`, chosenRemoteIds)
    }

    console.log("Deploy completed...")
    return chosenRemoteIds
}
