import { database, ProjectEntry } from "../Pg"
import { keys } from "lodash"

export function validateAdminKey(adminKey: string) {
    if (!adminKey) {
        throw new Error(`Cannot create a new project without providing an admin key`)
    }

    if (adminKey !== process.env.ADMIN_KEY) {
        throw new Error(`Incorrect admin key provided`)
    }
}

export async function getProjectByApiKey(apiKey: string): Promise<ProjectEntry | undefined> {
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

    const result = await database.query(query)
    return result.rows[0]
}
