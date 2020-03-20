/* eslint-disable @typescript-eslint/no-var-requires */
const packageJson = require("./package.json")
const AdmZip = require("adm-zip")

const fs = require("fs")
const path = require("path")

function removeFile(location) {
    if (!fs.existsSync(location)) {
        return
    }

    if (fs.lstatSync(location).isFile()) {
        fs.unlinkSync(location)
    } else {
        throw new Error(`${location} is not a file`)
    }
}

async function createDeployableArchive() {
    const { version } = packageJson
    const outName = `distributed-lock-server-build-v${version}.zip`

    // remove same old build, if it exists
    removeFile(path.resolve(__dirname, outName))

    const zip = new AdmZip()

    zip.addLocalFolder("migrate", "migrate")
    zip.addLocalFolder("build", "build")

    packageJson.scripts.start = `npm rebuild && ${packageJson.scripts.start}`
    const stringified = JSON.stringify(packageJson, null, 4)
    zip.addFile("package.json", Buffer.alloc(stringified.length, stringified), stringified)

    zip.writeZip(outName, err => {
        if (err) {
            throw new Error(err)
        }
    })
}

createDeployableArchive()
