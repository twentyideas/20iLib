import Axios from "axios"
import { sanitizeUrl } from "helpers/sanitizeUrl"
import { computed, observable } from "mobx"
import Base from "./Base"

const axios = Axios.create({})

export const SERVER_URLS = {
    USA: "https://useast.20idistributedlock.com",
    LOCAL: "http://localhost:5000/api"
}

export enum SERVER {
    USA = "USA",
    LOCAL = "LOCAL",
    NONE = "NONE"
}

interface DistributedLockState {
    server: string
    apiKey: string
    projects: string[]
    selectedProject: string
    selectedProjectApiKeys: string[]
}

export default class DistributedLock extends Base {
    _getters = ["server"]

    @observable
    state: DistributedLockState = {
        server: "",
        apiKey: "",
        projects: [],
        selectedProject: "",
        selectedProjectApiKeys: []
    }

    private validateCanTalkToServer = (data?: any) => {
        if (!this.state.server) {
            throw new Error(`Cannot POST to server without setting a server first`)
        }

        const key = (data && data.adminKey) || this.state.apiKey
        if (!key) {
            throw new Error(`Cannot POST to server without setting an api key first`)
        }
    }

    private POST = async (url: string, data?: any) => {
        this.validateCanTalkToServer(data)
        const fullURL = sanitizeUrl([this.state.server, url].join("/"))
        const fullData = {
            adminKey: this.state.apiKey,
            ...data
        }
        const res = await axios.post(fullURL, fullData)
        return res.data
    }

    private GET = async (url: string) => {
        this.validateCanTalkToServer()
        const fullURL = sanitizeUrl([this.state.server, url].join("/"))
        const res = await axios.get(fullURL)
        return res.data
    }

    private GetServerUrl = (server: SERVER) => {
        if (server === SERVER.USA) return SERVER_URLS.USA
        if (server === SERVER.LOCAL) return SERVER_URLS.LOCAL
        return ""
    }

    actions = {
        setServer: async (server: SERVER) => {
            const { store } = this
            if (!store) {
                return
            }

            this.state.server = this.GetServerUrl(server)
            this.state.apiKey = ""

            if (server === SERVER.NONE) {
                return
            }

            try {
                await store.dialogs.create({
                    title: "Enter apikey",
                    message: "",
                    withInput: {
                        label: "apiKey",
                        value: localStorage.getItem("adminKey") || ""
                    },
                    cancellable: true,
                    actions: [
                        {
                            name: "Submit",
                            fn: async apiKey => {
                                await this.actions.setApiKey(apiKey)
                                localStorage.setItem("adminKey", apiKey)
                            }
                        }
                    ]
                })
            } catch (e) {
                this.state.server = ""
            }
        },
        setApiKey: async (apiKey: string) => {
            try {
                const result = await this.POST("project/get", { adminKey: apiKey })
                this.state.apiKey = apiKey
                this.state.projects = result
            } catch (e) {
                throw new Error("Invalid Api key")
            }
        },
        createProject: async () => {
            const { store } = this
            if (!store) {
                return
            }

            await store.dialogs.create({
                title: "Create project",
                message: "Enter project name to create",
                withInput: {
                    label: "name",
                    value: "",
                    validator: str => (str.length <= 3 ? "Too short" : true)
                },
                cancellable: true,
                actions: [
                    {
                        name: "Submit",
                        fn: async name => {
                            await this.POST("project/create", { name })
                            await this.actions.refreshProjectList()
                        }
                    }
                ]
            })
        },
        deleteProject: async (project: string) => {
            const { store } = this
            if (!store) {
                return
            }

            await store.dialogs.create({
                title: "Delete project",
                message: `Are you sure you want to delete: ${project}`,
                cancellable: true,
                actions: [
                    {
                        name: "Yes",
                        fn: async () => {
                            await this.POST("project/delete", { name: project })
                            await this.actions.refreshProjectList()
                            if (this.state.selectedProject === project) {
                                this.state.selectedProject = ""
                            }
                        }
                    }
                ]
            })
        },
        setProject: async (project: string) => {
            if (project && !this.state.projects.includes(project)) {
                throw new Error(`No such project: ${project}`)
            }
            if (project) {
                this.state.selectedProject = project
                await this.actions.refreshSelectedProjectApiKeys()
            } else {
                this.state.selectedProject = ""
                this.state.selectedProjectApiKeys = []
            }
        },
        refreshProjectList: async () => {
            this.state.projects = await this.POST("project/get")
        },
        refreshSelectedProjectApiKeys: async () => {
            const project = this.state.selectedProject
            if (!project) {
                throw new Error(`Cannot get api keys without selecting project first`)
            }
            this.state.selectedProjectApiKeys = await this.POST("api-key/get-by-project", { projectName: project })
        },
        createApiKey: async () => {
            const project = this.state.selectedProject
            if (!project) {
                throw new Error(`Cannot get api keys without selecting project first`)
            }
            await this.POST("api-key/create", { projectName: project })
            await this.actions.refreshSelectedProjectApiKeys()
        },
        deleteApiKey: async (apiKey: string) => {
            const { store } = this
            if (!store) {
                return
            }

            await store.dialogs.create({
                title: "Revoke api key",
                message: "Are you sure you want to revoke this api key?",
                cancellable: true,
                actions: [
                    {
                        name: "Yes",
                        fn: async () => {
                            await this.POST("api-key/delete", { apiKey })
                            await this.actions.refreshSelectedProjectApiKeys()
                        }
                    }
                ]
            })
        }
    }

    @computed
    get server(): string {
        if (this.state.server === SERVER_URLS.USA) {
            return SERVER.USA
        }
        if (this.state.server === SERVER_URLS.LOCAL) {
            return SERVER.LOCAL
        }
        return SERVER.NONE
    }

    @computed
    get selectedProject(): string {
        return this.state.selectedProject || ""
    }
}
