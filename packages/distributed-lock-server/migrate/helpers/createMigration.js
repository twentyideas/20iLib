/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs")
const moment = require("moment")

const { sep } = require("path")
const SemanticVersion = require("./SemanticVersion")

const version = new SemanticVersion().toString()

const versionStr = `v${version.split(".").join("_")}.js`
const fileName = [moment().format(`YYYYMMDDhhmmss`), versionStr].join("-")
const text = [
    `/* eslint-disable @typescript-eslint/no-var-requires */`,
    `const { DATA_TYPES, fk, createTable } = require("../helpers/migrationHelpers")`,
    ``,
    `exports.up = async (db, done) => {`,
    ``,
    `}`,
    ``,
    `exports.down = async (db, done) => {`,
    ``,
    `}`,
    ``
]
const path = [__dirname, "../migrations", fileName].join(sep)

fs.writeFileSync(path, text.join("\n"))

console.log(`Successfully created new migration file: migrate/migrations/${fileName}`)
