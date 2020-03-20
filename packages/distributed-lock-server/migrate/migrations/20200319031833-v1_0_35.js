/* eslint-disable @typescript-eslint/no-var-requires */
const { DATA_TYPES, fk, createTables, dropTables, alterTable_addUniqueConstraint, alterTable_removeUniqueConstraint } = require("../helpers/migrationHelpers")

const stdColumns = {
    id: { primaryKey: true, type: DATA_TYPES.INTEGER, notNull: true, autoIncrement: true },
    date_created: DATA_TYPES.BIG_INTEGER,
    date_updated: DATA_TYPES.BIG_INTEGER
}

const tablesToCreate = [
    {
        name: "projects",
        columns: {
            name: { type: DATA_TYPES.STRING, unique: true },
            ...stdColumns
        }
    },
    {
        name: "apikeys",
        columns: {
            project_id: fk("projects", "apikeys"),
            api_key: DATA_TYPES.TEXT,
            ...stdColumns
        }
    },
    {
        name: "locks",
        columns: {
            project_id: fk("projects", "locks"),
            lock_key: DATA_TYPES.TEXT,
            date_expiration: DATA_TYPES.BIG_INTEGER,
            ...stdColumns
        }
    }
]

exports.up = async (db, done) => {
    await createTables(db, tablesToCreate)
    await alterTable_addUniqueConstraint(db, "locks", ["project_id", "lock_key"])
    done()
}

exports.down = async (db, done) => {
    await alterTable_removeUniqueConstraint(db, "locks", ["project_id", "lock_key"])
    await dropTables(db, tablesToCreate)
    done()
}
