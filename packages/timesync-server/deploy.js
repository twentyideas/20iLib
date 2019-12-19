/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path")
const { herokuDeployNode } = require("@20i/heroku-deploy-node")

herokuDeployNode({
    // name of the project
    projectName: "twentyideas-timesync",

    // heroku remote ids
    remoteIds: ["twentyideas-timesync"],

    // Generates a build zip that is then run on heroku
    buildRoot: __dirname,
    buildDirs: [path.resolve(__dirname, "./build"), path.resolve(__dirname, "./node_modules")],
    buildFiles: [path.resolve(__dirname, "./package.json")],

    // optional. Provide this if you want this function to update versions
    packageJsons: [path.resolve(__dirname, "./package.json")]
})
