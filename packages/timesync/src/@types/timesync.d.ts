declare module "timesync-fork-wolf" {
    type TimeSyncEvents = "change" | "error" | "sync"

    interface TsInitParams {
        delay?: number
        interval?: number | null
        now?: () => number
        peers?: string | string[]
        repeat?: number
        server?: string
        timeout?: number
    }

    interface TimeSyncInstance {
        on: (eventName: TimeSyncEvents, fn: (value: any) => void) => void
        off: (eventName: TimeSyncEvents, fn: (value: any) => void) => void
        destroy: () => void
        now: () => number
        sync: () => void
    }

    const create: (params: TsInitParams) => TimeSyncInstance
}
