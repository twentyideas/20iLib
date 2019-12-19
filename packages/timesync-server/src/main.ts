import cors from "cors"
import App from "./App"
import { toNumber } from "lodash"

async function main(): Promise<void> {
    const PORT = toNumber(process.env.PORT) || 5000
    const middlewares = [cors({ exposedHeaders: "Date" })]
    const app = new App(PORT, middlewares)
    app.listen()
}

main()
