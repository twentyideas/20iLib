import { v4 as uuid } from "uuid"
import BaseController from "./BaseController"
import { ApiKeys, Projects } from "../Pg"
import { validateAdminKey } from "../services/Helpers"

interface CreateApiKeyParams {
    projectId?: number
    projectName?: string
    adminKey: string
}

interface DeleteApiKeyParams {
    id?: number
    apiKey?: string
    adminKey: string
}

interface DeleteAllParams {
    projectId?: number
    projectName?: string
    adminKey: string
}

export class ApiKeyController extends BaseController {
    path = "/api-key"

    constructor() {
        super()

        this.POST = [
            {
                name: "create",
                fn: async (input: CreateApiKeyParams, exits) => {
                    try {
                        validateAdminKey(input.adminKey)
                    } catch (e) {
                        return exits.Error401_UNAUTHORIZED(e.message)
                    }

                    const projectEntry = await Projects.findOneErrorOnNotFound({ id: input.projectId, name: input.projectName })
                    const apiKey = await ApiKeys.create({ project_id: projectEntry.id, api_key: uuid() })
                    return exits.OK(apiKey.api_key)
                }
            },
            {
                name: "delete",
                fn: async (input: DeleteApiKeyParams, exits) => {
                    try {
                        validateAdminKey(input.adminKey)
                    } catch (e) {
                        return exits.Error401_UNAUTHORIZED(e.message)
                    }

                    const entry = await ApiKeys.findOneErrorOnNotFound({ id: input.id, api_key: input.apiKey })
                    await ApiKeys.deleteById(entry.id)
                    return exits.OK(`Deleted api key`)
                }
            },
            {
                name: "delete-all",
                fn: async (input: DeleteAllParams, exits) => {
                    try {
                        validateAdminKey(input.adminKey)
                    } catch (e) {
                        return exits.Error401_UNAUTHORIZED(e.message)
                    }

                    const project = await Projects.findOneErrorOnNotFound({ id: input.projectId, name: input.projectName })
                    const deletedRows = await ApiKeys.delete({ project_id: project.id })
                    return exits.OK(`${deletedRows.length} api keys deleted for project: ${project.name}`)
                }
            }
        ]

        this.initRoutes()
    }
}
