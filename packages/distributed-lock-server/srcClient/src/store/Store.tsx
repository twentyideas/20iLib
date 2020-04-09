import AppContext from "./modules/AppContext"
import DistributedLock from "./modules/DistributedLock"
import Route from "./modules/Route"
import Toasts from "./modules/Toasts"
import Dialogs from "./modules/Dialogs"

export class Store {
    appContext: AppContext
    distributedLock: DistributedLock
    route: Route
    toasts: Toasts
    dialogs: Dialogs

    constructor() {
        this.appContext = new AppContext()
        this.distributedLock = new DistributedLock()
        this.route = new Route()
        this.toasts = new Toasts()
        this.dialogs = new Dialogs()
    }

    async init() {
        const promises = [this.appContext.init(this), this.distributedLock.init(this), this.route.init(this), this.toasts.init(this), this.dialogs.init(this)]
        return Promise.all(promises)
    }
}

export default new Store()
