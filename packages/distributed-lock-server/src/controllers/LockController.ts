import BaseController from "./BaseController"
import { getProjectByApiKey } from "../services/Helpers"
import { Locks } from "../Pg"

interface CreateLockParams {
    apiKey: string
    lockName: string
    expirationTimeMs?: number
}

interface DeleteLockParams {
    apiKey: string
    lockName: string
}

interface GetLockParams {
    apiKey: string
}

export class LockController extends BaseController {
    path = "/lock"

    constructor() {
        super()

        this.GET = [
            {
                name: "all",
                fn: async (input: GetLockParams, exits) => {
                    const project = await getProjectByApiKey(input.apiKey)
                    if (!project) {
                        return exits.Error404_NOT_FOUND(`No project found with the api key provided`)
                    }

                    const locks = await Locks.find({ project_id: project.id })
                    return exits.OK(locks)
                }
            }
        ]

        this.POST = [
            {
                name: "create",
                fn: async (input: CreateLockParams, exits) => {
                    const project = await getProjectByApiKey(input.apiKey)
                    if (!project) {
                        return exits.Error404_NOT_FOUND(`No project found with the api key provided`)
                    }

                    const now = new Date().getTime()
                    let expireDuration = 10000
                    if (input.expirationTimeMs && input.expirationTimeMs > 0) {
                        expireDuration = input.expirationTimeMs
                    }

                    try {
                        await Locks.create({ project_id: project.id, lock_key: input.lockName, date_expiration: now + expireDuration })
                        return exits.OK()
                    } catch (e) {
                        // find existing lock, the only way this can fail is if we have an existing lock
                        const existingLock = await Locks.findOneErrorOnNotFound({ project_id: project.id })
                        if (now > existingLock.date_expiration) {
                            // we can kill this entry and remake a new one
                            await Locks.deleteById(existingLock.id)
                            await Locks.create({ project_id: project.id, lock_key: input.lockName, date_expiration: now + expireDuration })
                            return exits.OK()
                        }

                        // otherwise, we are out of luck. We must wait!
                        return exits.Error403_FORBIDDEN(e.message)
                    }
                }
            },
            {
                name: "delete",
                fn: async (input: DeleteLockParams, exits) => {
                    const project = await getProjectByApiKey(input.apiKey)
                    if (!project) {
                        return exits.Error404_NOT_FOUND(`No project found with the api key provided`)
                    }

                    await Locks.delete({ project_id: project.id, lock_key: input.lockName })
                    return exits.OK()
                }
            }
        ]

        this.initRoutes()
    }
}
