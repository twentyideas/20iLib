const path = require("path")
const scripts = require("../packages/scripts/dist")

console.log("Running post publish script...")
const lernaFile = path.resolve(__dirname, "../lerna.json")
const version = JSON.parse(scripts.helpers.file.readFile(lernaFile)).version

scripts.cmd.runCommand("git add -A")
scripts.cmd.runCommand(`git commit -m 'release-version-${version}'`)
scripts.cmd.runCommand(`git push`)

console.log("Finished running post publish script")