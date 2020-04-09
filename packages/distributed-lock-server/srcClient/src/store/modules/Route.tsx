import { observable, action } from "mobx"
import Base from "./Base"
import { Store } from "../Store"
import { HistoryListenerParameter, HistoryLocation, globalHistory } from "@reach/router"

interface RouteState {
    location: HistoryLocation
    prevLocation: HistoryLocation | undefined
}

export default class Route extends Base {
    @observable state: RouteState = {
        location: globalHistory.location,
        prevLocation: undefined
    }

    init = async (store: Store) => {
        await super.init(store)
        globalHistory.listen(this.onHistoryChange)

        return Promise.resolve()
    }

    @action
    onHistoryChange = (listener: HistoryListenerParameter) => {
        this.state.prevLocation = this.state.location
        this.state.location = listener.location
    }
}
