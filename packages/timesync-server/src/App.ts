import express from "express"
import * as timesyncServer from "timesync-fork-wolf/server"

type MiddleWareFn = (req: express.Request, res: express.Response, next: () => void) => void

export default class App {
    app: express.Application
    port: number

    constructor(port: number, middlewares: MiddleWareFn[]) {
        this.app = express()
        this.port = port

        middlewares.forEach(middleware => this.app.use(middleware))
        this.app.use("/timesync", timesyncServer.requestHandler)
        this.app.use("/now", (req, res) => {
            res.status(200).send(new Date().toISOString())
        })
    }

    listen = () => {
        this.app.listen(this.port, () => console.log(`time-sync server listening at port: ${this.port}`))
    }
}
