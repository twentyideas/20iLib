import express from "express"
import BaseController from "./controllers/BaseController"
import { database } from "./Pg"

type MiddleWareFn = (req: express.Request, res: express.Response, next: () => void) => void

export default class App {
    app: express.Application
    port: number

    constructor(port: number, controllers: BaseController[], middlewares: MiddleWareFn[]) {
        this.app = express()
        this.port = port
        middlewares.forEach(middleware => this.app.use(middleware))
        controllers.forEach(controller => this.app.use("/api/", controller.router))

        this.app.use("/", (req, res) => {
            res.status(200).send("You have reached 20i distributed lock server")
        })
    }

    listen = () => {
        this.app.listen(this.port, () => console.log(`distributed lock server listening at port: ${this.port}`))
    }
}
