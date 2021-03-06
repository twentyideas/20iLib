import BaseController from "./BaseController"
import { Projects, Locks, ApiKeys } from "../Pg"
import { validateAdminKey, apiKeyLocalCache } from "../services/Helpers"

interface CreateProjectParams {
    name: string
    adminKey: string
}

interface DeleteProjectParams {
    id?: number
    name?: string
    adminKey: string
}

interface GetProjectsParams {
    adminKey: string
}

export class ProjectController extends BaseController {
    path = "/project"

    constructor() {
        super()

        this.POST = [
            {
                name: "create",
                fn: async (input: CreateProjectParams, exits) => {
                    try {
                        validateAdminKey(input.adminKey)
                    } catch (e) {
                        return exits.Error401_UNAUTHORIZED(e.message)
                    }

                    const result = await Projects.create({ name: input.name })
                    return exits.OK(result)
                }
            },
            {
                name: "delete",
                fn: async (input: DeleteProjectParams, exits) => {
                    try {
                        validateAdminKey(input.adminKey)
                    } catch (e) {
                        return exits.Error401_UNAUTHORIZED(e.message)
                    }

                    const projectEntry = await Projects.findOneErrorOnNotFound({ id: input.id, name: input.name })
                    // kill all locks
                    await Locks.delete({ project_id: projectEntry.id })

                    // kill all api keys
                    const deletedKeys = await ApiKeys.delete({ project_id: projectEntry.id })
                    deletedKeys.forEach(row => apiKeyLocalCache.remove(row.api_key))

                    // kill project
                    const result = await Projects.deleteById(projectEntry.id)
                    return exits.OK(result)
                }
            },
            {
                name: "get",
                fn: async (input: GetProjectsParams, exits) => {
                    try {
                        validateAdminKey(input.adminKey)
                    } catch (e) {
                        return exits.Error401_UNAUTHORIZED(e.message)
                    }

                    const allProjects = await Projects.find({})
                    return exits.OK(allProjects.map(project => project.name))
                }
            }
        ]

        this.initRoutes()
    }
}
