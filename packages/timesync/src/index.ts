import moment from "moment"
import * as TimeSync from "timesync-fork-wolf"

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

export class TimeClient {
    offsetMs = 0
    timeSyncInstance?: TimeSync.TimeSyncInstance

    server = ""

    syncing = false

    sync = (params?: Partial<TimeSyncOptions>) => {
        const { timesyncEndpoint, timeout, delay, numSyncs } = getOptions(params)
        let elapsedMs = -100

        return new Promise((resolve, reject) => {
            if (this.syncing) {
                resolve()
                return
            }

            let remainingSyncs = numSyncs
            const timeSyncInstance = TimeSync.create({ server: timesyncEndpoint, interval: null, delay, timeout, repeat: numSyncs })

            const onError = (err: any) => {
                this.syncing = false
                timeSyncInstance.destroy()
                reject(err || "TimeSync::Error occurred")
            }

            // this function makes sure that we do actually reject this promise after the timeout specified!
            const rejectOnTimeoutLoop = () => {
                elapsedMs += 100
                if (!this.syncing) {
                    // the loop ends here
                    return
                }

                if (elapsedMs >= timeout) {
                    // the loop ends here
                    return onError(`TimeSync:: Timeout of ${timeout} exceeded`)
                }
                setTimeout(rejectOnTimeoutLoop, 100)
            }

            this.syncing = true
            timeSyncInstance.sync()
            timeSyncInstance.on("change", (offset: number) => {
                remainingSyncs -= 1
                this.offsetMs = offset
                console.log(`TimeSync:: updated time offset to: ${this.offsetMs} ms. Remaining syncs: ${remainingSyncs}`)
                if (remainingSyncs <= 0) {
                    // destroy instance on resolve to kill the connection
                    this.syncing = false
                    timeSyncInstance.destroy()
                    resolve(this.offsetMs)
                }
            })
            timeSyncInstance.on("error", onError)
            rejectOnTimeoutLoop()
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
