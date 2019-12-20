declare module "timesync-fork-wolf/server" {
    const attachServer: (server: http.Server, path: string) => void
    const createServer: () => void
    const requestHandler: (req: any, res: any) => void
}
