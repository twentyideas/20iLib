/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs")
const { join } = require("path")

const isFile = source => fs.lstatSync(source).isFile()

module.exports = function getAllFiles(source, defaultVal) {
    try {
        return fs
            .readdirSync(source)
            .map(name => join(source, name))
            .filter(isFile)
    } catch (e) {
        if (defaultVal) return defaultVal
        throw e
    }
}
