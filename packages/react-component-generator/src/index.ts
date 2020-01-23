#! /usr/bin/env node
import inquirer from "inquirer"
import lodash from "lodash"
import { getConfig, createConfig } from "./config"
import generateComponent from "./generateComponent"
import generateStoreModule from "./generateStoreModule"

const TYPES = {
    COMPONENT: "Generate Component (atom, molecule, organism, page)",
    STORE_MODULE: "Generate Store Module",
    EXIT: "Quit"
}

async function start(firstRun = true) {
    const config = getConfig()
    if (!config) {
        console.log(`No config found...creating config`)
        // create default config!
        createConfig()
    }

    const questions = [
        {
            type: "list",
            choices: lodash.values(TYPES),
            name: "answer",
            message: firstRun ? "What would you like to do?" : "Would you like to generate more?"
        }
    ]

    const { answer } = await inquirer.prompt(questions)
    if (answer === TYPES.COMPONENT) {
        await generateComponent()
        await start(false)
    } else if (answer === TYPES.STORE_MODULE) {
        await generateStoreModule()
        await start(false)
    } else {
        console.log(`\nTy for using the generator!`)
    }
}

start()
