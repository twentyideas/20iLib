import * as scripts from "@20i/scripts"
import * as path from "path"

export const RCG_FOLDER = path.resolve(process.cwd(), ".react-component-generator")

export function getConfig(): undefined | ReactComponentGeneratorConfig {
    const configPath = path.resolve(RCG_FOLDER, "config.json")
    try {
        const file = scripts.helpers.file.readFile(configPath)
        if (!file) {
            return undefined
        }
        const config: ReactComponentGeneratorConfig = JSON.parse(file)
        return config
    } catch (e) {
        return undefined
    }
}

export function createConfig() {
    const dest = path.resolve(RCG_FOLDER, "config.json")
    const config: ReactComponentGeneratorConfig = {
        COMPONENT_TEMPLATE_PATH: ".react-component-generator/templates/component.tsx.template",
        PAGE_TEMPLATE_PATH: ".react-component-generator/templates/page.tsx.template",
        STORE_MODULE_TEMPLATE_PATH: ".react-component-generator/templates/storeModule.tsx.template",
        STORE_TEMPLATE_PATH: ".react-component-generator/templates/store.tsx.template",
        PATHS: {
            ATOMS: "src/components/atoms",
            MOLECULES: "src/components/molecules",
            ORGANISMS: "src/components/organisms",
            PAGES: "src/pages",
            STORE_MODULES: "src/store/modules"
        }
    }
    const data = JSON.stringify(config, null, 4)
    scripts.helpers.file.writeFile({ dest, data })
    scripts.helpers.file.copyDir(path.resolve(__dirname, "./templates"), path.resolve(RCG_FOLDER, "templates"))
    console.log(`created config`)
}
