/* eslint-disable @typescript-eslint/no-var-requires */
const lodash = require("lodash")
const dt = require("db-migrate-shared").dataType

/* eslint-disable-next-line */
const { BIG_INTEGER, BIGINT, BINARY, BLOB, BOOLEAN, CHAR, DATE, DATE_TIME, DECIMAL, INTEGER, REAL, SMALL_INTEGER, SMALLINT, STRING, TEXT, TIME, TIMESTAMP } = dt

const helpers = {
    fk(foreignTable, currentTable, suffix) {
        const s = suffix ? `${suffix}_` : ""
        return {
            type: INTEGER,
            foreignKey: {
                table: foreignTable,
                mapping: "id",
                name: `${currentTable}_${foreignTable}_${s}id_fk`,
                rules: {
                    onDelete: "CASCADE",
                    onUpdate: "RESTRICT"
                }
            }
        }
    },
    addForeignKey(db, foreignTable, currentTable, suffix, setBadDataToNull) {
        const s = suffix ? `${suffix}_` : ""
        const name = `${currentTable}_${foreignTable}_${s}id_fk`
        const rules = {
            onDelete: "CASCADE",
            onUpdate: "RESTRICT"
        }

        return new Promise(async (resolve, reject) => {
            let mappingKey = `${foreignTable}_id`
            if (suffix) {
                mappingKey = `${suffix}_${foreignTable}_id`
            }

            const cb = err => {
                if (err) {
                    return reject(err)
                }

                return resolve()
            }

            try {
                const querySrt = `ALTER TABLE ${currentTable} DROP CONSTRAINT IF EXISTS ${name}`
                await helpers.query(db, querySrt)

                if (setBadDataToNull) {
                    const query = [
                        `UPDATE ${currentTable}`,
                        `SET ${mappingKey} = NULL`,
                        `WHERE`,
                        `   ${currentTable}.${mappingKey} IS NOT NULL`,
                        `   AND NOT EXISTS (`,
                        `       SELECT *`,
                        `       FROM ${foreignTable} WHERE ${currentTable}.${mappingKey} = ${foreignTable}.id`,
                        `)`
                    ].join(" ")
                    const result = await helpers.query(db, query)
                    if (result.rowCount) {
                        console.warn("Adding FK on", currentTable, "as", name, "with mapping", mappingKey, `to id. Updated ${result.rowCount} rows`)
                    }
                }

                return db.addForeignKey(currentTable, foreignTable, name, { [mappingKey]: "id" }, rules, cb)
            } catch (e) {
                return reject(e)
            }
        })
    },
    removeForeignKey(db, foreignTable, currentTable, suffix) {
        const s = suffix ? `${suffix}_` : ""
        const name = `${currentTable}_${foreignTable}_${s}id_fk`
        return new Promise((resolve, reject) => {
            const cb = err => {
                return err ? reject() : resolve()
            }
            db.removeForeignKey(currentTable, name, { dropIndex: true }, cb)
        })
    },
    query(db, sqlQueryString) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await db.runSql(sqlQueryString)
                const arr = result && result.rowCount ? result.rows : []
                arr.rowCount = result.rowCount
                return resolve(arr)
            } catch (e) {
                console.error(`@@@@ Query failed:`, sqlQueryString)
                return reject(e)
            }
        })
    },
    createTable(db, { name, columns }) {
        return db.createTable(name, {
            columns: columns,
            ifNotExists: true
        })
    },
    async createTables(db, tables) {
        if (!db || !tables) return Promise.reject(new Error(`db or tables invalid!`))

        return new Promise((resolve, reject) => {
            async function doCreate(idx) {
                const entry = tables[idx]
                if (!entry) return resolve()

                try {
                    await helpers.createTable(db, entry)
                    return doCreate(idx + 1)
                } catch (e) {
                    return reject(e)
                }
            }

            doCreate(0)
        })
    },
    dropTables(db, tables) {
        if (!db || !tables) return Promise.reject(new Error(`db or tables invalid!`))

        return new Promise((resolve, reject) => {
            async function doDestroy(idx) {
                const entry = tables[idx]
                if (!entry) return resolve()

                try {
                    console.log(`Dropping table`, entry.name)
                    await db.dropTable(entry.name, { ifExists: true, cascade: true })
                    return doDestroy(idx - 1)
                } catch (e) {
                    return reject(e)
                }
            }

            doDestroy(tables.length - 1)
        })
    },
    addColumn(db, table, columnName, columnSpec) {
        if (!db || !table) return Promise.reject(new Error(`db or table invalid on addColumn`))

        return new Promise((resolve, reject) => {
            db.addColumn(table, columnName, columnSpec, err => {
                return err ? reject(err) : resolve()
            })
        })
    },
    async addColumns(db, table, columns) {
        if (!db || !table) throw new Error(`db or table invalid on addColumns`)

        if (!lodash.every(columns, (v, k) => !!v && !!k)) throw new Error(`columns invalid on addColumns`)

        try {
            const promises = lodash.reduce(
                columns,
                (acc, spec, name) => {
                    acc.push(helpers.addColumn(db, table, name, spec))
                    return acc
                },
                []
            )
            await Promise.all(promises)
        } catch (e) {
            throw e
        }
    },
    async removeColumns(db, table, columnNames) {
        if (!db || !table) throw new Error(`db or table invalid on removeColumns`)

        try {
            const arr = lodash.isArray(columnNames) ? columnNames : [columnNames]
            await Promise.all(arr.map(cname => db.removeColumn(table, cname)))
        } catch (e) {
            throw e
        }
    },
    async renameColumn(db, table, oldName, newName) {
        return new Promise((resolve, reject) => {
            db.renameColumn(table, oldName, newName, err => {
                return err ? reject(err) : resolve()
            })
        })
    },
    alterTable_addUniqueConstraint(db, table, columnNames) {
        if (!columnNames || !lodash.isArray(columnNames) || !columnNames.length) {
            return Promise.reject(new Error("columnNames not specified"))
        }

        const badColumnNames = columnNames.filter(c => !c)
        if (badColumnNames.length) {
            return Promise.reject(new Error(`The following column names are invalid: ${JSON.stringify(badColumnNames)}`))
        }

        if (!db || !table) {
            return Promise.reject(new Error(`The db or table does not exist`))
        }

        const constraintName = [table, ...columnNames].join("_")
        return new Promise(async (resolve, reject) => {
            const sqlStatement = [`ALTER TABLE ${table}`, `ADD CONSTRAINT ${constraintName}`, `UNIQUE (${columnNames.join(",")})`].join(" ")

            try {
                const result = await db.runSql(sqlStatement)
                return resolve(result)
            } catch (e) {
                return reject(e)
            }
        })
    },
    alterTable_removeUniqueConstraint(db, table, columnNames) {
        if (!columnNames || !lodash.isArray(columnNames) || !columnNames.length) {
            return Promise.reject(new Error("columnNames not specified"))
        }

        const badColumnNames = columnNames.filter(c => !c)
        if (badColumnNames.length) {
            return Promise.reject(new Error(`The following column names are invalid: ${JSON.stringify(badColumnNames)}`))
        }

        if (!db || !table) {
            return Promise.reject(new Error(`The db or table does not exist`))
        }

        const constraintName = [table, ...columnNames].join("_")
        return new Promise(async (resolve, reject) => {
            const sqlStatement = `ALTER TABLE ${table} DROP CONSTRAINT ${constraintName}`
            try {
                const result = await db.runSql(sqlStatement)
                return resolve(result)
            } catch (e) {
                return reject(e)
            }
        })
    },
    DATA_TYPES: {
        BIG_INTEGER,
        BIGINT,
        BINARY,
        BLOB,
        BOOLEAN,
        CHAR,
        DATE,
        DATE_TIME,
        DECIMAL,
        INTEGER,
        JSON: "json",
        REAL,
        SMALL_INTEGER,
        SMALLINT,
        STRING,
        TEXT,
        TIME,
        TIMESTAMP
    }
}

module.exports = helpers
