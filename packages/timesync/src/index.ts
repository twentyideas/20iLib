import moment from "moment"
import * as TimeSync from "timesync"

type momentInput = string | number | void | moment.Moment | Date | (string | number)[] | moment.MomentInputObject | undefined
type momentFormat = string | moment.MomentBuiltinFormat | (string | moment.MomentBuiltinFormat)[] | undefined

export class TimeClient {
    offsetMs: number = 0
    timeSyncInstance?: TimeSync.TimeSyncInstance

    init = (timesyncEndpoint: string = "https://twentyideas-timesync.herokuapp.com/timesync", interval?: number) => {
        return new Promise(resolve => {
            const i = interval && interval > 0 ? Math.max(10000, interval) : undefined
            if (i && i !== interval) {
                console.log(`Timesync interval to ${i} ms. That is the minimum`)
            }

            this.timeSyncInstance = i ? TimeSync.create({ server: timesyncEndpoint, interval: i }) : TimeSync.create({ server: timesyncEndpoint })
            this.timeSyncInstance.on("change", (offset: number) => {
                this.offsetMs = offset
                console.log(`updated time offset to: ${this.offsetMs} ms`)
                resolve()
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
