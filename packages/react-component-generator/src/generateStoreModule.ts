import * as lib from "@20i/scripts"
import inquirer from "inquirer"
import lodash from "lodash"
import * as path from "path"
import { getConfig } from "./config"

function getPaths() {
    const CONFIG = getConfig()
    if (!CONFIG) {
        throw new Error("Cannot read react-component-generator config!")
    }

    const MODULES_PATH = path.resolve(process.cwd(), CONFIG.PATHS.STORE_MODULES)
    const STORE_PATH = path.resolve(MODULES_PATH, "../Store.tsx")

    const MODULE_TEMPLATE_PATH = path.resolve(process.cwd(), CONFIG.STORE_MODULE_TEMPLATE_PATH)
    const STORE_TEMPLATE_PATH = path.resolve(process.cwd(), CONFIG.STORE_TEMPLATE_PATH)

    return {
        MODULES_PATH,
        STORE_PATH,
        MODULE_TEMPLATE_PATH,
        STORE_TEMPLATE_PATH
    }
}

const CHOICES = {
    NEW_MODULE: "New Module",
    EXIT: "<- Back"
}

function spacing(times = 1) {
    const tabs = (times: number): string => {
        const spaces = `    `
        if (times <= 1) {
            return spaces
        }
        return spaces + tabs(times - 1)
    }

    return `\n${tabs(times)}`
}

function generateMasterStoreFile() {
    const { MODULES_PATH, STORE_PATH, STORE_TEMPLATE_PATH } = getPaths()

    const modulesFileNames = lib.helpers.file.filesInDirectory(MODULES_PATH, false)
    const moduleClassNames = modulesFileNames.map(m => lodash.last(m.split(path.sep))!.replace(".tsx", "")).filter(n => n !== "Base")
    const modulePropNames = moduleClassNames.map(lodash.camelCase)

    const params = {
        imports: moduleClassNames.map(n => `import ${n} from "./modules/${n}"`).join("\n"),

        properties: modulePropNames
            .map((prop, idx) => {
                const className = moduleClassNames[idx]
                return `${prop}: ${className}`
            })
            .join(spacing(1)),

        constructor: modulePropNames
            .map((prop, idx) => {
                const className = moduleClassNames[idx]
                return `this.${prop} = new ${className}()`
            })
            .join(spacing(2)),

        init: modulePropNames.map(prop => `this.${prop}.init(this)`).join(`,${spacing(3)}`)
    }

    const dest = STORE_PATH
    const data = lib.helpers.file.getTemplate(STORE_TEMPLATE_PATH, params)
    lib.helpers.file.writeFile({ dest, data })
}

function generateBaseFile() {
    const { MODULES_PATH } = getPaths()
    const basePath = path.resolve(MODULES_PATH, "./Base.tsx")
    if (lib.helpers.file.fileExists(basePath)) {
        return
    }

    const baseContent = [
        `import { Store } from "../Store"`,
        ``,
        `export default class Base {`,
        `   store?: Store = undefined`,
        `   async init(store: Store) {`,
        `       this.store = store`,
        `       return Promise.resolve()`,
        `   }`,
        `}`
    ].join("\n")

    lib.helpers.file.writeFile({ dest: basePath, data: baseContent })
}

function generate(name: string) {
    const { MODULES_PATH, MODULE_TEMPLATE_PATH } = getPaths()

    console.log(`Create ${name}`)
    const fileName = `${name}.tsx`
    const dest = path.resolve(MODULES_PATH, fileName)
    const data = lib.helpers.file.getTemplate(MODULE_TEMPLATE_PATH, { name })
    lib.helpers.file.writeFile({ dest, data })

    /* now re-generate the store/Store.tsx file! */
    generateMasterStoreFile()

    /* generate Base file if non-existent */
    generateBaseFile()
}

async function generator(firstRun = true) {
    const { MODULES_PATH } = getPaths()

    const { name, type } = await inquirer.prompt([
        {
            name: "type",
            message: "Do you want to create another store module?",
            type: "list",
            choices: lodash.values(CHOICES),
            when: () => !firstRun
        },
        {
            name: "name",
            message: "What is the name of your store module?",
            when: answers => firstRun || answers.type === CHOICES.NEW_MODULE,
            validate: v => {
                const files = lib.helpers.file.filesInDirectory(MODULES_PATH)
                const names = files.map(f => lodash.last(f.split(path.sep))!.replace(".tsx", "")).map(lodash.toLower)
                if (names.includes(v.toLowerCase())) {
                    return `A module with name: ${v} already exists!`
                }
                return true
            }
        }
    ])

    if (type === CHOICES.EXIT) {
        return
    }

    if (!name) {
        throw new Error(`Cannot create a store module without a name!!`)
    }

    generate(name)
    await generator(false)
}

export default generator
