import { Theme as MuiTheme } from "@material-ui/core"
import { isEqual } from "lodash"
import { action, observable, computed, toJS } from "mobx"
import Base from "./Base"
import { Store } from "../Store"
import { Theme } from "style"

interface AppContextScreen {
    width: number
    height: number
    xs: boolean
    sm: boolean
    md: boolean
    lg: boolean
    xl: boolean
    size: string
}
interface AppContextTime {
    started: string
    now: string
}
interface AppContextState {
    version: string
    clientVersion: string
    environment: string
    currentPage: string
    devMode: boolean
    screen: AppContextScreen
    time: AppContextTime
    theme: MuiTheme
}

function getScreenSize(screenWidth: number) {
    const out = {
        xs: false,
        sm: false,
        md: false,
        lg: false,
        xl: false,
        size: ""
    }

    if (screenWidth >= Theme.breakpoints.values.xl) {
        out.xl = true
        out.size = "xl"
    } else if (screenWidth >= Theme.breakpoints.values.lg) {
        out.lg = true
        out.size = "lg"
    } else if (screenWidth >= Theme.breakpoints.values.md) {
        out.md = true
        out.size = "md"
    } else if (screenWidth >= Theme.breakpoints.values.sm) {
        out.sm = true
        out.size = "sm"
    } else {
        out.xs = true
        out.size = "xs"
    }

    return out
}

function startPeriodicUpdate(appContextInstance: AppContext, interval: number = 500) {
    const payload = {
        screen: {
            width: window.innerWidth,
            height: window.innerHeight,
            ...getScreenSize(window.innerWidth)
        },
        time: {
            now: new Date().toISOString()
        }
    } as Partial<AppContextState>

    appContextInstance.update(payload)

    setTimeout(startPeriodicUpdate, interval, appContextInstance)
}

export default class AppContext extends Base {
    _getters = ["needsRefresh"]

    @observable state: AppContextState = {
        version: "1.0.0",
        clientVersion: localStorage.getItem("version") || "1.0.0",
        environment: "dev",
        currentPage: "/",
        devMode: false,
        time: { started: new Date().toISOString(), now: new Date().toISOString() },
        screen: {
            width: window.innerWidth,
            height: window.innerHeight,
            ...getScreenSize(window.innerWidth)
        },
        theme: Theme
    }

    constructor(version: string = "1.0.0", environment: string = "dev") {
        super()
        this.state.environment = environment
        this.state.version = version
    }

    @computed
    get needsRefresh() {
        return this.state.clientVersion !== this.state.version
    }

    @action
    update(payload: Partial<AppContextState>) {
        /* we have to update in this manner */
        if (payload.version) this.state.version = payload.version
        if (payload.clientVersion) this.state.clientVersion = payload.clientVersion
        if (payload.environment) this.state.environment = payload.environment
        if (payload.currentPage) this.state.currentPage = payload.currentPage
        if (payload.devMode) this.state.devMode = payload.devMode

        if (payload.screen) {
            const currScreen = toJS(this.state.screen)
            const newScreen = { ...currScreen, ...payload.screen }
            if (!isEqual(newScreen, currScreen)) {
                this.state.screen = newScreen
            }
        }

        if (payload.time && payload.time.started) this.state.time.started = payload.time.started
        if (payload.time && payload.time.now) this.state.time.now = payload.time.now

        if (payload.theme) {
            this.state.theme = toJS(payload.theme)
        }
    }

    async init(store: Store) {
        await super.init(store)
        startPeriodicUpdate(this, 1000)
    }
}
