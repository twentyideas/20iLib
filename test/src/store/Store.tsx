import Bobo from "./modules/Bobo"
import Jojo from "./modules/Jojo"

export class Store {
    bobo: Bobo
    jojo: Jojo

    constructor() {
        this.bobo = new Bobo()
        this.jojo = new Jojo()
    }

    async init() {
        const promises = [
            this.bobo.init(this),
            this.jojo.init(this)
        ]
        return Promise.all(promises)
    }
}

export default new Store();