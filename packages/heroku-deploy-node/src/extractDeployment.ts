/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path")
const AdmZip = require("adm-zip")

const zipPath = path.resolve(__dirname, "./out.zip")
const zipFile = new AdmZip(zipPath)

zipFile.extractAllTo(path.resolve(__dirname, "out"))
