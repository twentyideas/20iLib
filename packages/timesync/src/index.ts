import moment from "moment"
import * as TimeSync from "timesync-fork-wolf"
import promiseChain from "./promiseChain"

type momentInput = string | number | void | moment.Moment | Date | (string | number)[] | moment.MomentInputObject | undefined
type momentFormat = string | moment.MomentBuiltinFormat | (string | moment.MomentBuiltinFormat)[] | undefined

interface TimeSyncOptions {
    timesyncEndpoint: string
    delay: number
    timeout: number
    numSyncs: number
}

function getOptions(partial?: Partial<TimeSyncOptions>): TimeSyncOptions {
    return {
        timesyncEndpoint: partial?.timesyncEndpoint || "https://twentyideas-timesync.herokuapp.com/timesync",
        delay: partial?.delay ? Math.min(partial.delay, 50) : 1000,
        timeout: partial?.timeout ? Math.max(partial.timeout, 10000) : 10000,
        numSyncs: partial?.numSyncs ? Math.max(partial.numSyncs, 2) : 2
    }
}

const VERSION = [1, 1, 3].join(".")
const NAME = `TimeSync(${VERSION})::`

const helpers = {
    sync: async (timeSyncInstance: TimeSync.TimeSyncInstance): Promise<number> => {
        let remainingSyncs = 2
        let offsetMs = 0
        return new Promise((resolve, reject) => {
            timeSyncInstance.sync()
            timeSyncInstance.on("change", (offset: number) => {
                remainingSyncs -= 1
                offsetMs = offset
                if (remainingSyncs <= 0) {
                    // destroy instance on resolve to kill the connection
                    resolve(offsetMs)
                }
            })
            timeSyncInstance.on("error", reject)
        })
    },
    range: (n: number) => Array(...Array(n)).map((x, i) => i)
}

export class TimeClient {
    offsetMs = 0
    server = ""

    syncing = false

    sync = (params?: Partial<TimeSyncOptions>) => {
        const { timesyncEndpoint, timeout, delay, numSyncs } = getOptions(params)

        return new Promise(async (resolve, reject) => {
            if (this.syncing) {
                resolve()
                return
            }

            // looks like it always does 2 requests per sync. So we encapsulate it.
            const nSync = Math.max(1, Math.floor(numSyncs / 2))
            const timeSyncInstance = TimeSync.create({ server: timesyncEndpoint, interval: null, delay, timeout })

            this.syncing = true
            let isFinished = false

            const onSuccess = (offset: number | undefined) => {
                isFinished = true
                this.syncing = false
                timeSyncInstance.destroy()
                if (offset !== undefined) {
                    this.offsetMs = offset
                }
                return resolve()
            }
            const onError = (err: any) => {
                isFinished = true
                this.syncing = false
                timeSyncInstance.destroy()
                return reject(err || `${NAME} Error occurred`)
            }

            const fns = helpers.range(nSync).map(i => async () => {
                const offsetMs = await helpers.sync(timeSyncInstance)
                console.log(`${NAME} updated time offset to: ${offsetMs} ms. Remaining syncs: ${nSync - i - 1}`)
                return offsetMs
            })

            // run the sync op
            promiseChain(fns)
                .then(onSuccess)
                .catch(onError)

            // ensure timeout is respected
            setTimeout(() => !isFinished && onError(`${NAME} Timeout of ${timeout} exceeded while trying to sync`), timeout)
        })
    }

    now() {
        return moment().add(this.offsetMs, "milliseconds")
    }

    getMoment(inp?: momentInput, format?: momentFormat, strict?: boolean) {
        return moment(inp, format, strict)
    }

    getMomentWithOffset(inp?: momentInput, format?: momentFormat, strict?: boolean) {
        return this.getMoment(inp, format, strict).add(this.offsetMs, "milliseconds")
    }
}

export default new TimeClient()
