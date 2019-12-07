import * as lib from "@20i/scripts"
import inquirer from "inquirer"
import lodash from "lodash"
import * as path from "path"
import { getConfig } from "./config"

const CHOICES = {
    ATOM: "Atom",
    MOLECULE: "Molecule",
    ORGANISM: "Organism",
    PAGE: "Page",
    EXIT: "<- Back"
}

function getPaths() {
    const CONFIG = getConfig()
    if (!CONFIG) {
        throw new Error("Cannot read react-component-generator config!")
    }

    const PATHS = {
        [CHOICES.ATOM]: path.resolve(process.cwd(), CONFIG.PATHS.ATOMS),
        [CHOICES.MOLECULE]: path.resolve(process.cwd(), CONFIG.PATHS.MOLECULES),
        [CHOICES.ORGANISM]: path.resolve(process.cwd(), CONFIG.PATHS.ORGANISMS),
        [CHOICES.PAGE]: path.resolve(process.cwd(), CONFIG.PATHS.PAGES)
    }

    const TEMPLATES = {
        [CHOICES.ATOM]: [path.resolve(process.cwd(), CONFIG.COMPONENT_TEMPLATE_PATH)],
        [CHOICES.MOLECULE]: [path.resolve(process.cwd(), CONFIG.COMPONENT_TEMPLATE_PATH)],
        [CHOICES.ORGANISM]: [path.resolve(process.cwd(), CONFIG.COMPONENT_TEMPLATE_PATH)],
        [CHOICES.PAGE]: [path.resolve(process.cwd(), CONFIG.PAGE_TEMPLATE_PATH)]
    }

    return { PATHS, TEMPLATES }
}

function generate(name: string, type: string, directory: string) {
    const { TEMPLATES } = getPaths()

    // read all the template files.
    let subcategory = lodash.last(directory.split(path.sep))
    if (!subcategory) {
        throw new Error(`Cannot generator because directory: ${directory} is invalid!`)
    }

    if (subcategory.toLowerCase().slice(0, -1) === type.toLowerCase()) {
        subcategory = ""
    }

    const className = lodash.camelCase([subcategory, name, type].filter(Boolean).join("-"))

    const params = { name, className }

    const writeFiles = TEMPLATES[type].map(templatePath => {
        const outFileName = [name, "tsx"].join(".")
        const dest = path.resolve(directory, outFileName)
        const data = lib.helpers.file.getTemplate(templatePath, params)
        return { dest, data }
    })

    writeFiles.forEach(({ dest, data }) => {
        lib.helpers.file.writeFile({ dest, data })
        console.log(`Successfully created file: ${dest}`)
    })
}

interface IAnswers {
    type: string
    category: string
    category2: string
    name: string
}

async function generator(firstRun = true) {
    const { PATHS } = getPaths()

    const questions = [
        {
            type: "list",
            choices: lodash.values(CHOICES),
            name: "type",
            message: firstRun ? "What type of component you like to generate?" : "Generate more components?"
        },
        {
            type: "list",
            message: "Does this have a category?",
            name: "category",
            when: (prevAnswers: IAnswers) => prevAnswers.type !== CHOICES.EXIT,
            choices: (prevAnswers: IAnswers) => {
                const { type } = prevAnswers
                const foldersInDir = lib.helpers.file.dirsInDirectory(PATHS[type]).map(dir => {
                    const rootFolder = path.normalize(PATHS[type])
                    const thisFolder = path.normalize(dir)
                    const diff = thisFolder.replace(rootFolder, "")
                    return { name: diff, value: dir }
                })
                return [...foldersInDir, { name: "+ Create", value: null }, { name: "No", value: PATHS[type] }]
            }
        },
        {
            name: "category2",
            message: "Enter name of new category",
            type: "input",
            validate: (v: string) => !!v && v.length >= 3,
            when: (prevAnswers: IAnswers) => !prevAnswers.category && prevAnswers.type !== CHOICES.EXIT
        },
        {
            name: "name",
            message: "Enter name of component",
            type: "input",
            when: (prevAnswers: IAnswers) => prevAnswers.type !== CHOICES.EXIT,
            validate(v: string) {
                if (!v || !v.length) {
                    return `Must have length`
                }
                if (v[0] !== v[0].toUpperCase()) {
                    return `Name must start with uppercase!!`
                }
                return true
            }
        }
    ]

    const { name, type, category, category2 } = await inquirer.prompt(questions)

    if (type === CHOICES.EXIT) {
        return
    }

    // generate it
    // console.log(`answers`, { name, type, category, category2 })
    let dir = category
    if (!dir) {
        dir = path.resolve(PATHS[type], category2)
    }

    generate(name, type, dir)
    await generator(false)
}

export default generator
