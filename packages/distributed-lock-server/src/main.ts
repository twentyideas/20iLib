import cors from "cors"
import bodyParser from "body-parser"
import { toNumber } from "lodash"
import { config as dotenvInit } from "dotenv"
import App from "./App"
import { database } from "./Pg"
import { LockController } from "./controllers/LockController"
import { ProjectController } from "./controllers/ProjectController"
import { ApiKeyController } from "./controllers/ApiKeyController"

async function main(): Promise<void> {
    dotenvInit()
    await database.connect()
    const PORT = toNumber(process.env.PORT) || 5000

    const controllers = [new LockController(), new ProjectController(), new ApiKeyController()]
    const middlewares = [cors({ exposedHeaders: "Date" }), bodyParser.json()]
    const app = new App(PORT, controllers, middlewares)
    app.listen()
}

main()
