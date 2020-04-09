import * as path from "path"
import express from "express"
import BaseController from "./controllers/BaseController"
import * as mimes from "./services/mimes"

type MiddleWareFn = (req: express.Request, res: express.Response, next: () => void) => void

export default class App {
    app: express.Application
    port: number

    constructor(port: number, controllers: BaseController[], middlewares: MiddleWareFn[]) {
        this.app = express()
        this.port = port
        middlewares.forEach(middleware => this.app.use(middleware))
        controllers.forEach(controller => this.app.use("/api/", controller.router))

        /* serve static files */
        express.static.mime.define(mimes.typeMap)
        this.app.use(express.static(path.resolve(__dirname, "./buildSite")))
        this.app.get("*", (req, res) => res.sendFile(path.resolve(__dirname, "./buildSite/index.html")))
    }

    listen = () => {
        this.app.listen(this.port, () => console.log(`distributed lock server listening at port: ${this.port}`))
    }
}
