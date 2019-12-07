/* eslint-disable @typescript-eslint/no-var-requires */
console.log("@20i/react-component-generator Running postbuild")

const path = require("path")
const scripts = require("@20i/scripts")

scripts.helpers.file.copyDir(path.resolve(__dirname, "./src/templates"), path.resolve(__dirname, "./dist/templates"))
