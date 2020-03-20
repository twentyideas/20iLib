import { Pool } from "pg"
import { keys, get, pickBy, isUndefined } from "lodash"

export enum TABLE {
    API_KEYS = "apikeys",
    LOCKS = "locks",
    PROJECTS = "projects"
}

export interface BaseEntry {
    id: number
    date_created: number
    date_updated: number
}

export interface LockEntry extends BaseEntry {
    project_id: number
    lock_key: string
    date_expiration: number
}

export interface ProjectEntry extends BaseEntry {
    name: string
}

export interface ApiKeyEntry extends BaseEntry {
    project_id: number
    api_key: string
}

export const database = new Pool()

function Sanitize<K extends object>(obj: K): Partial<K> {
    return pickBy(obj, v => !isUndefined(v))
}

class ModelFunctions<T extends BaseEntry> {
    private table: TABLE

    constructor(tableName: TABLE) {
        this.table = tableName
    }

    private props = (obj: any): string[] => keys(obj).sort()
    private values = (obj: Partial<T>): any[] => this.props(obj).map(prop => get(obj, prop))
    private templateProps = (obj: Partial<T>): string => this.props(obj).join(", ")
    private templateValues = (obj: Partial<T>, startingIdx = 1) => {
        return this.props(obj)
            .map((k, i) => `$${i + startingIdx}`)
            .join(", ")
    }
    private templatePropValues = (obj: Partial<T>, connector = " AND ", startingIdx = 1) => {
        return this.props(obj)
            .map((prop, idx) => `${prop} = $${idx + startingIdx}`)
            .join(connector)
    }

    create = async (val: Omit<T, "id" | "date_updated" | "date_created">): Promise<T> => {
        const now = new Date().getTime()
        const newEntry = {
            ...Sanitize(val),
            date_created: now,
            date_updated: now
        }

        const { templateProps, templateValues, values, table } = this
        const result = await database.query({
            text: `INSERT INTO ${table}(${templateProps(newEntry)}) VALUES(${templateValues(newEntry)}) RETURNING *`,
            values: values(newEntry)
        })

        return result.rows[0]
    }

    updateById = async (id: number, val: Partial<Omit<T, "id" | "date_updated" | "date_created">>): Promise<T | undefined> => {
        const updateVal = {
            ...Sanitize(val),
            date_updated: new Date().getTime()
        }

        const { templatePropValues, values, table } = this

        const result = await database.query({
            text: `UPDATE ${table} SET ${templatePropValues(updateVal, ", ", 2)} WHERE id = $1 RETURNING *`,
            values: [id, ...values(updateVal)]
        })

        return result.rows[0]
    }

    update = async (query: Partial<T>, updateVal: Partial<Omit<T, "id" | "date_updated" | "date_created">>): Promise<T[]> => {
        const toVal = {
            ...Sanitize(updateVal),
            date_updated: new Date().getTime()
        }
        const queryObj = Sanitize(query)

        const { templatePropValues, values, table } = this

        const updValues = values(toVal)
        const queryValues = values(queryObj)

        const result = await database.query({
            text: `UPDATE ${table} SET ${templatePropValues(toVal, ", ")} WHERE ${templatePropValues(queryObj, " AND ", updValues.length + 1)} RETURNING *`,
            values: [...updValues, ...queryValues]
        })

        return result.rows
    }

    deleteById = async (id: number): Promise<T | undefined> => {
        const query = {
            text: `DELETE FROM ${this.table} WHERE id = $1 RETURNING *`,
            values: [id]
        }

        const result = await database.query(query)
        return result.rows[0]
    }

    delete = async (query: Partial<T>): Promise<T[]> => {
        const { templatePropValues, values, table } = this
        const queryObj = Sanitize(query)
        const result = await database.query({
            text: `DELETE FROM ${table} WHERE ${templatePropValues(queryObj, " AND ")} RETURNING *`,
            values: values(queryObj)
        })

        return result.rows
    }

    find = async (query: Partial<T>): Promise<T[]> => {
        const { templatePropValues, values, table } = this
        const queryObj = Sanitize(query)
        const result = await database.query({
            text: `SELECT * FROM ${table} WHERE ${templatePropValues(queryObj, " AND ")}`,
            values: values(queryObj)
        })
        return result.rows
    }

    findOne = async (query: Partial<T>): Promise<T | undefined> => {
        const queryObj = Sanitize(query)
        if (!keys(queryObj).length) {
            throw new Error(`Empty query provided to findOne for ${this.table}`)
        }

        const result = await this.find(query)
        return result[0]
    }

    findById = async (id: number): Promise<T | undefined> => {
        const query = {
            text: `SELECT * FROM ${this.table} WHERE id = $1`,
            values: [id]
        }

        const result = await database.query(query)
        return result.rows[0]
    }

    findOneErrorOnNotFound = async (query: Partial<T>): Promise<T> => {
        const result = await this.findOne(query)
        if (!result) {
            throw new Error(`Could not find ${this.table} with given query`)
        }
        return result
    }

    findByIdErrorOnNotFound = async (id: number): Promise<T> => {
        const result = await this.findById(id)
        if (!result) {
            throw new Error(`Could not find ${this.table} with id: ${id}`)
        }
        return result
    }

    updateByIdErrorOnNotFound = async (id: number, val: Partial<Omit<T, "id" | "date_updated" | "date_created">>): Promise<T> => {
        const result = await this.updateById(id, val)
        if (!result) {
            throw new Error(`Could not update ${this.table} because there is no entry for id: ${id}`)
        }
        return result
    }
}

export const Locks = new ModelFunctions<LockEntry>(TABLE.LOCKS)
export const Projects = new ModelFunctions<ProjectEntry>(TABLE.PROJECTS)
export const ApiKeys = new ModelFunctions<ApiKeyEntry>(TABLE.API_KEYS)
