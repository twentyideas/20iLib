import lodash from "lodash"

interface EnvVars {
    [key: string]: string | number | boolean
}

export function onProcessExit(fn: NodeJS.SignalsListener) {
    process.on("SIGINT", fn)
}

export function getEnvVars() {
    const strings = process.argv.slice(2).map(s => (s.startsWith("--") ? s.slice(2) : s))
    return lodash.reduce(
        strings,
        (acc: EnvVars, v: string) => {
            if (v.indexOf("=") !== -1) {
                const [name, value] = v.split("=").map(s => lodash.trim(s))
                if (value === "true") {
                    acc[name] = true
                } else if (value === "false") {
                    acc[name] = false
                } else {
                    const num = lodash.toNumber(value)
                    acc[name] = lodash.isNaN(num) ? value : num
                }
            } else {
                acc[v] = true
            }
            return acc
        },
        {}
    )
}
