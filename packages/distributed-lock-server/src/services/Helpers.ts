import { database, ProjectEntry } from "../Pg"
import { keys, values, sortBy } from "lodash"

interface ApiKeyLocalMap {
    [apiKey: string]: {
        apiKey: string
        dateStored: string
        value: ProjectEntry
    }
}
class ApiKeyLocalCache {
    size = 0
    maxSize: number
    map: ApiKeyLocalMap = {}

    constructor(maxSize = 1000) {
        if (maxSize > 0) {
            this.maxSize = maxSize
        } else {
            this.maxSize = 1000
        }
    }

    add = (apiKey: string, value: ProjectEntry) => {
        if (this.size >= this.maxSize) {
            // remove the earliest one we have stored
            const [oldest] = sortBy(values(this.map), i => i.dateStored)
            this.remove(oldest.apiKey)
        }

        this.map[apiKey] = {
            apiKey,
            value,
            dateStored: new Date().toISOString()
        }
        this.size += 1
    }

    remove = (apiKey: string) => {
        if (this.map[apiKey]) {
            delete this.map[apiKey]
            this.size -= 1
        }
    }
}

export const apiKeyLocalCache = new ApiKeyLocalCache()

export function validateAdminKey(adminKey: string) {
    if (!adminKey) {
        throw new Error(`Cannot create a new project without providing an admin key`)
    }

    if (adminKey !== process.env.ADMIN_KEY) {
        throw new Error(`Incorrect admin key provided`)
    }
}

export async function getProjectByApiKey(apiKey: string): Promise<ProjectEntry | undefined> {
    const cachedEntry = apiKeyLocalCache.map[apiKey]
    if (cachedEntry) {
        return cachedEntry.value
    }

    const blankProjectEntry: ProjectEntry = {
        id: 0,
        name: "",
        date_created: 0,
        date_updated: 0
    }

    const selectStr = keys(blankProjectEntry).map(prop => `projects.${prop}`)

    const query = {
        text: `SELECT ${selectStr} FROM projects, apikeys WHERE projects.id = apikeys.project_id AND apikeys.api_key = $1`,
        values: [apiKey]
    }

    const rawResult = await database.query(query)
    const [result] = rawResult.rows

    apiKeyLocalCache.add(apiKey, result)
    return result
}
