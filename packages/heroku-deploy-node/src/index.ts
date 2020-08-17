import lodash from "lodash"
import * as path from "path"
import * as scripts from "@20i/scripts"
import inquirer from "inquirer"
import EnvPaths from "env-paths"
import fs from "fs"
import archiver from "archiver"

enum ReleaseType {
    PATCH = "patch",
    MINOR = "minor",
    MAJOR = "major",
    NONE = "none"
}

interface InquirerAnswers {
    chosenRemoteIds: string[]
    releaseType?: ReleaseType
}

interface BuildFilePathInfo {
    src: string
    dest: string
}

interface DeployParams {
    remoteIds: string[]
    projectName: string

    buildRoot: string
    buildDirs: (string | BuildFilePathInfo)[] | BuildFileInfoFn
    buildFiles: (string | BuildFilePathInfo)[] | BuildFileInfoFn

    packageJsons?: string[]
    zipCompressionLevel?: number

    dontAskReleaseType?: boolean
}

type BuildFileInfoFn = () => (string | BuildFilePathInfo)[]

interface CreateDeployParams {
    zipCompressionLevel?: number
    projectName: string
    buildRoot: string
    buildDirs: (string | BuildFilePathInfo)[] | BuildFileInfoFn
    buildFiles: (string | BuildFilePathInfo)[] | BuildFileInfoFn
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

const clamp = (val: number, min: number, max: number) => {
    if (val < min) return min
    if (val > max) return max
    return val
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
            runCommand(`git push ${remoteId} ${buildBranch}:master --force`, { silent: false })
        },
        deploy(remoteIds: string[]) {
            const cwd = process.cwd()

            process.chdir(PATHS.deploy.root)
            runCommand("git init")

            try {
                remoteIds.forEach((remoteId, idx) => {
                    console.log(`Deploying ${remoteId}...`)
                    helpers.heroku.addGitEnv(remoteId)

                    // we only need to commit on the first remoteId, since the working tree will be clean on the next one.
                    if (idx === 0) {
                        helpers.git.commit()
                    }

                    helpers.heroku.push(remoteId, "master")
                    console.log(`Finished deploying to ${remoteId}`)
                    helpers.heroku.removeGitEnv(remoteId)
                })
            } catch (e) {
                throw e
            }

            process.chdir(cwd)
        }
    },
    files: {
        async createDeployFolder({ projectName, buildFiles, buildDirs, buildRoot: root, version, zipCompressionLevel }: CreateDeployParams) {
            console.log(`Build folder: ${PATHS.deploy.root}`)
            console.log("Cleaning previous build (if any)...")
            if (scripts.helpers.file.dirExists(PATHS.deploy.root)) {
                scripts.helpers.file.removeDir(PATHS.deploy.root)
            }

            console.log("Creating folder...")
            scripts.helpers.file.createDir(PATHS.deploy.root)

            // isolate the build
            console.log("Creating build zip...")

            const folders = typeof buildDirs === "function" ? buildDirs() : buildDirs
            const files = typeof buildFiles === "function" ? buildFiles() : buildFiles

            const doZip = async () => {
                const output = fs.createWriteStream(PATHS.deploy.zip)
                const opts = { followSymlinks: true }
                const archive = archiver("zip", { ...opts, zlib: { level: zipCompressionLevel === undefined ? 5 : clamp(zipCompressionLevel, 0, 9) } })

                return new Promise(async (resolve, reject) => {
                    output.on("close", resolve)
                    output.on("error", reject)
                    archive.pipe(output)

                    folders.forEach(folder => {
                        if (typeof folder === "string") {
                            const relativePath = path.relative(root, folder)
                            archive.directory(folder, relativePath)
                        } else {
                            const relativePath = path.relative(root, folder.dest)
                            archive.directory(folder.src, relativePath)
                        }
                    })

                    files.forEach(file => {
                        let relativePath: string
                        let fileName: string
                        let readPath: string
                        if (typeof file === "string") {
                            const fileFolder = file
                                .split(path.sep)
                                .slice(0, -1)
                                .join(path.sep)
                            relativePath = path.relative(root, fileFolder)

                            // if this is a package.json, update the version number to the new one
                            fileName = file.split(path.sep).slice(-1)[0]
                            readPath = file
                        } else {
                            relativePath = path.relative(root, file.dest)
                            fileName = file.src.split(path.sep).slice(-1)[0]
                            readPath = file.src
                        }

                        const p = [relativePath, fileName].filter(Boolean).join(path.sep)
                        if (fileName === "package.json") {
                            try {
                                const packageJson = JSON.parse(fs.readFileSync(readPath, { encoding: "utf8" }))
                                packageJson.version = version
                                const stringified = JSON.stringify(packageJson, null, 4)
                                console.log(`Build:: Incrementing ${p} version to ${version}...`)
                                // zip.addFile(p, Buffer.alloc(stringified.length, stringified), stringified)
                                archive.append(stringified, { name: p })
                            } catch (e) {
                                console.error("Unable to increment package.json version. Adding file as is")
                                // zip.addLocalFile(file, relativePath)
                                archive.append(fs.createReadStream(readPath), { name: p })
                            }
                        } else {
                            archive.append(fs.createReadStream(readPath), { name: p })
                            // zip.addLocalFile(file, relativePath)
                        }
                    })

                    archive.finalize()
                })
            }

            await doZip()

            console.log("Finished creating zip!")

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
                            "extract-zip": "^2.0.0",
                            rimraf: "3.0.2"
                        },
                        scripts: {
                            // rebuild packages that need it!! delete the zip file, and dedupe the package
                            build: "node extractDeployment && rimraf ./out.zip && cd out && npm rebuild && npm dedupe",
                            start: "cd out && npm run start"
                        }
                    },
                    null,
                    4
                )
            })

            console.log("Finished creating deploy folder!")
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

export async function herokuDeployNode({
    remoteIds,
    projectName,
    buildDirs,
    buildFiles,
    buildRoot,
    packageJsons,
    zipCompressionLevel,
    dontAskReleaseType
}: DeployParams): Promise<string[]> {
    if (!remoteIds.length) {
        console.log("Please provide heroku remoteIds to deploy")
        return []
    }

    const answers = await inquirer.prompt(
        [
            {
                type: "checkbox",
                name: "chosenRemoteIds",
                choices: remoteIds,
                message: "Where would you like to deploy?",
                default: (): string[] => (remoteIds.length ? [remoteIds[0]] : []),
                when: () => remoteIds.length > 1
            },
            !dontAskReleaseType && {
                type: "list",
                name: "releaseType",
                choices: lodash.values(ReleaseType),
                message: "What type of depoy is this?",
                default: ReleaseType.PATCH
            }
        ].filter(Boolean)
    )

    const { chosenRemoteIds, releaseType } = helpers.ToInqurierAnswers(answers)
    if (!chosenRemoteIds.length) {
        if (remoteIds.length) {
            chosenRemoteIds.push(remoteIds[0])
        } else {
            console.log("Exiting early because no remote chosen")
            return []
        }
    }

    const newVersion = releaseType && releaseType !== ReleaseType.NONE ? helpers.files.getNewVersion(buildRoot, releaseType) : ""

    // Copy over only the files needed to run this thing! Node_modules copy will take a while!
    console.log("Setting up temp deploy folder...")
    await helpers.files.createDeployFolder({
        zipCompressionLevel,
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
