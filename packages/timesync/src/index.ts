import moment from "moment"
import * as TimeSync from "timesync-fork-wolf"

type momentInput = string | number | void | moment.Moment | Date | (string | number)[] | moment.MomentInputObject | undefined
type momentFormat = string | moment.MomentBuiltinFormat | (string | moment.MomentBuiltinFormat)[] | undefined

export class TimeClient {
    offsetMs = 0
    timeSyncInstance?: TimeSync.TimeSyncInstance

    server = ""

    syncing = false

    init = (timesyncEndpoint = "https://twentyideas-timesync.herokuapp.com/timesync", interval?: number | null, delay = 1000, timeout = 10000) => {
        return new Promise((resolve, reject) => {
            const i = interval && interval > 0 ? Math.max(10000, interval) : null
            if (i && i !== interval) {
                console.log(`Timesync interval to ${i} ms. That is the minimum`)
            }

            let changes = 0

            this.timeSyncInstance = i
                ? TimeSync.create({ server: timesyncEndpoint, interval: i, delay, timeout })
                : TimeSync.create({ server: timesyncEndpoint, delay, timeout })

            this.timeSyncInstance.on("change", (offset: number) => {
                changes += 1
                this.offsetMs = offset
                console.log(`updated time offset to: ${this.offsetMs} ms`)
                if (changes >= 2) {
                    resolve()
                }
            })
            this.timeSyncInstance.on("error", () => {
                if (this.timeSyncInstance) {
                    this.timeSyncInstance.destroy()
                }
                this.timeSyncInstance = undefined
                reject()
            })
        })
    }

    sync = (timesyncEndpoint = "https://twentyideas-timesync.herokuapp.com/timesync", delay = 1000, timeout = 10000) => {
        return new Promise((resolve, reject) => {
            if (this.syncing) {
                resolve()
                return
            }

            let changes = 0
            const timeSyncInstance = TimeSync.create({ server: timesyncEndpoint, interval: null, delay, timeout })
            this.syncing = true
            timeSyncInstance.sync()
            timeSyncInstance.on("change", (offset: number) => {
                changes += 1
                this.offsetMs = offset
                console.log(`updated time offset to: ${this.offsetMs} ms`)
                if (changes >= 2) {
                    this.syncing = false

                    // destroy instance on resolve to kill the connection
                    timeSyncInstance.destroy()
                    resolve()
                }
            })
            timeSyncInstance.on("error", () => {
                this.syncing = false
                timeSyncInstance.destroy()
                reject()
            })
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
