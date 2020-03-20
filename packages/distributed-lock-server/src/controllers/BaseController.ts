import express from "express"

export interface Exits {
    OK: (result?: any) => void
    Error400_BAD_REQUEST: (reason?: string) => void
    Error404_NOT_FOUND: (reason?: string) => void
    Error401_UNAUTHORIZED: (reason?: string) => void
    Error403_FORBIDDEN: (reason?: string) => void
    Error500_SERVER_ERROR: (reason?: string) => void
    Error503_SERVICE_UNAVAILABLE: (reason?: string) => void
}

type EndpointFn = (input: any, exits: Exits, req: express.Request) => Promise<void> | void

export interface Endpoint {
    name: string
    path?: string
    fn: EndpointFn
}

export default abstract class BaseController {
    router = express.Router()
    private static RequestHandler = async (endpoint: Endpoint, req: express.Request, res: express.Response) => {
        const params = { ...req.body, ...req.params }
        const exits = BaseController.GetExits(res)
        try {
            await endpoint.fn(params, exits, req)
        } catch (e) {
            exits.Error500_SERVER_ERROR(e.message || e)
        }
    }
    private static GetExits(res: express.Response): Exits {
        let called = ""
        const markCalled = (name: string) => {
            if (called) {
                console.warn(`Trying to exit with ${name} when already exited with ${called}`)
                return false
            }
            called = name
            return true
        }

        return {
            OK: (result?: any) => markCalled("Ok") && res.status(200).send(result),
            Error400_BAD_REQUEST: (reason?: string) => markCalled("Error400") && res.status(400).send(reason),
            Error401_UNAUTHORIZED: (reason?: string) => markCalled("Error401") && res.status(401).send(reason),
            Error403_FORBIDDEN: (reason?: string) => markCalled("Error403") && res.status(403).send(reason),
            Error404_NOT_FOUND: (reason?: string) => markCalled("Error404") && res.status(404).send(reason),
            Error500_SERVER_ERROR: (reason?: string) => markCalled("Error500") && res.status(500).send(reason),
            Error503_SERVICE_UNAVAILABLE: (reason?: string) => markCalled("Error503") && res.status(503).send(reason)
        }
    }

    initRoutes() {
        const instance = this
        const getPath = (endpoint: Endpoint) => [instance.path, endpoint.path || endpoint.name].filter(Boolean).join("/")

        if (instance.GET) {
            instance.GET.forEach(endpoint => {
                const path = getPath(endpoint)
                console.log(`Generated route path: GET api${path}`)
                instance.router.get(path, (req, res) => BaseController.RequestHandler(endpoint, req, res))
            })
        }

        if (instance.POST) {
            instance.POST.forEach(endpoint => {
                const path = getPath(endpoint)
                console.log(`Generated route path: POST api${path}`)
                instance.router.post(path, (req, res) => BaseController.RequestHandler(endpoint, req, res))
            })
        }

        if (instance.PUT) {
            instance.PUT.forEach(endpoint => {
                const path = getPath(endpoint)
                console.log(`Generated route path: PUT api${path}`)
                instance.router.put(path, (req, res) => BaseController.RequestHandler(endpoint, req, res))
            })
        }

        if (instance.DELETE) {
            instance.DELETE.forEach(endpoint => {
                const path = getPath(endpoint)
                console.log(`Generated route path: DELETE api${path}`)
                instance.router.delete(path, (req, res) => BaseController.RequestHandler(endpoint, req, res))
            })
        }
    }

    abstract path: string
    public GET: Endpoint[] = []
    public POST: Endpoint[] = []
    public PUT: Endpoint[] = []
    public DELETE: Endpoint[] = []
}
