/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path")
const extractZip = require("extract-zip")

async function extract() {
    console.log("extracting...")

    const start = new Date().getTime()

    const zipPath = path.resolve(__dirname, "./out.zip")
    const outputPath = path.resolve(__dirname, "out")

    await extractZip(zipPath, { dir: outputPath })

    const end = new Date().getTime()
    const total = (end - start) / 1000
    console.log(`Finished extracting in ${total} seconds`)
    process.exit(0)
}

extract()
