/* eslint-disable @typescript-eslint/no-var-requires */
const lodash = require("lodash")
const { sep } = require("path")
const dotenv = require("dotenv")
const getAllFiles = require("./helpers/getAllFiles")

dotenv.config()

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } = process.env

if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) {
    throw new Error(`Missing params from env: ${JSON.stringify({ PGDATABASE, PGHOST, PGHOST, PGPASSWORD, PGPORT })}`)
}

const SemanticVersion = require("./helpers/SemanticVersion")

const dbm = require("db-migrate").getInstance(true, {
    env: "dev",
    cwd: "./migrate/",
    config: {
        dev: {
            driver: "pg",
            host: PGHOST,
            database: PGDATABASE,
            user: PGUSER,
            password: PGPASSWORD,
            port: PGPORT
        }
    }
})

function findMatchingVersion(currentVersion, migrations) {
    let out = null
    lodash.each(migrations, migration => {
        const result = migration.version.isLessThanOrEqualTo(currentVersion)
        if (result) out = migration
    })
    return out
}

function runMigrations() {
    const migrationsPath = `${__dirname}${sep}migrations`
    const allMigrations = getAllFiles(migrationsPath).map(fileName => {
        const name = lodash.last(fileName.split(sep)).replace(".js", "")
        const [date, version] = name.split("-")
        return {
            date,
            version: new SemanticVersion(
                version
                    .replace("v", "")
                    .split("_")
                    .join(".")
            )
        }
    })

    const currentVersion = new SemanticVersion()
    const match = findMatchingVersion(currentVersion, allMigrations)
    return !match ? dbm.up(1) : dbm.sync(match.date)
    // return dbm.down(3)
}

runMigrations()
