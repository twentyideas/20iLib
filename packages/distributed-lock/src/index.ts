import axios from "axios"

export const SERVERS = {
    USA: "http://20idistributedlockservice-env-1.eba-mjmg2uk2.us-west-2.elasticbeanstalk.com",
    DEV: "http://localhost:5000"
}

interface AcquireLockParams {
    lockName: string
    fn: () => Promise<any>
    expirationTimeMs?: number
    timeout?: number
    DEBUG_NAME?: string
}

interface CreateLockParams {
    apiKey: string
    lockName: string
    expirationTimeMs?: number
}

interface DeleteLockParams {
    apiKey: string
    lockName: string
}

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function getTimestamp(date?: Date) {
    if (!date) {
        date = new Date()
    }
    return [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()].join(":")
}

export class DistributedLock {
    private apiKey: string
    private serverAddr: string
    private retryInterval: number

    constructor(apiKey: string, server: "USA" | "DEV" | string = "USA", retryInterval = 250) {
        this.apiKey = apiKey

        if (server === "DEV") {
            this.serverAddr = SERVERS.DEV
        } else if (server === "USA") {
            this.serverAddr = SERVERS.USA
        } else {
            this.serverAddr = server
        }

        this.retryInterval = retryInterval
    }

    private deleteLock = async (lockName: string) => {
        const url = [this.serverAddr, "api/lock/delete"].join("/")
        const data: DeleteLockParams = {
            apiKey: this.apiKey,
            lockName
        }
        await axios.post(url, data)
    }

    private getLockLoop = async (params: AcquireLockParams) => {
        const url = [this.serverAddr, "api/lock/create"].join("/")
        const data: CreateLockParams = {
            apiKey: this.apiKey,
            lockName: params.lockName,
            expirationTimeMs: params.expirationTimeMs
        }

        return new Promise((resolve, reject) => {
            let elapsedMs = 0
            const loop = async () => {
                const loopStartTime = new Date().getTime()
                try {
                    await axios.post(url, data)
                    return resolve()
                } catch (e) {
                    elapsedMs += new Date().getTime() - loopStartTime + this.retryInterval
                    if (params.timeout && elapsedMs > params.timeout) {
                        return reject(`${params.DEBUG_NAME} Timed out while waiting for lock: ${params.lockName}`)
                    }

                    if (params.DEBUG_NAME) {
                        console.log(`${params.DEBUG_NAME} - ${params.lockName} not available. waiting. (${elapsedMs} ms elapsed)`)
                    }

                    await wait(this.retryInterval)
                    loop()
                }
            }
            loop()
        })
    }

    acquireLock = async (params: AcquireLockParams): Promise<any> => {
        if (!params.lockName) {
            throw new Error(`Lockname cannot be empty`)
        }

        const start = new Date()
        if (params.DEBUG_NAME) {
            console.log(`${params.DEBUG_NAME} getting lock`, getTimestamp(start))
        }

        await this.getLockLoop(params)

        const end = new Date()
        if (params.DEBUG_NAME) {
            console.log(`${params.DEBUG_NAME} granted at`, getTimestamp(end), "waited", end.getTime() - start.getTime(), "ms")
        }

        // kill our lock in either case!!
        try {
            const result = await params.fn()
            await this.deleteLock(params.lockName)
            return result
        } catch (e) {
            await this.deleteLock(params.lockName)
            throw e
        }
    }
}
