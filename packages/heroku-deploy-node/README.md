# @20i/heroku-deploy-node

This package aims to make it super easy to deploy a server to heroku

```javascript
const path = require("path")
const { herokuDeployNode } = require("@20i/heroku-deploy-node")

herokuDeployNode({
    // name of the project
    projectName: "myproject",

    // heroku remote ids
    remoteIds: ["myproject-dev", "myproject-prod"],

    // Generates a build zip that is then run on heroku
    buildRoot: path.resolve(__dirname, "./backend"),
    buildDirs: [path.resolve(__dirname, "./backend/build"), path.resolve(__dirname, "./backend/node_modules")],
    buildFiles: [path.resolve(__dirname, "./backend/package.json")],

    // optional. Provide this if you want this function to update versions
    packageJsons: [
        path.resolve(__dirname, "./lerna.json"),
        path.resolve(__dirname, "./backend/package.json"),
        path.resolve(__dirname, "./frontend/package.json"),
        path.resolve(__dirname, "./shared/package.json")
    ]
})
```

You can also provide additional info describing src and dest

```javascript
const path = require("path")
const { herokuDeployNode } = require("@20i/heroku-deploy-node")

herokuDeployNode({
    // name of the project
    projectName: "myproject",

    // heroku remote ids
    remoteIds: ["myproject-dev", "myproject-prod"],

    // Generates a build zip that is then run on heroku
    buildRoot: path.resolve(__dirname, "./backend"),
    buildDirs: [
        path.resolve(__dirname, "./backend/build"),
        path.resolve(__dirname, "./backend/node_modules"),
        { src: path.resolve(__dirname, "./backend/my-folder"), dest: "my-folder" }
    ],
    buildFiles: [
        path.resolve(__dirname, "./backend/package.json"),
        { src: path.resolve(__dirname, "./backend/my-file.txt"), dest: "" } // goes to the root of the build
    ],

    // optional. Provide this if you want this function to update versions
    packageJsons: [
        path.resolve(__dirname, "./lerna.json"),
        path.resolve(__dirname, "./backend/package.json"),
        path.resolve(__dirname, "./frontend/package.json"),
        path.resolve(__dirname, "./shared/package.json")
    ]
})
```

Or you can provide a function that does so

```javascript
const path = require("path")
const { herokuDeployNode } = require("@20i/heroku-deploy-node")

herokuDeployNode({
    // name of the project
    projectName: "myproject",

    // heroku remote ids
    remoteIds: ["myproject-dev", "myproject-prod"],

    // Generates a build zip that is then run on heroku
    buildRoot: path.resolve(__dirname, "./backend"),
    buildDirs: () => [
        path.resolve(__dirname, "./backend/build"),
        path.resolve(__dirname, "./backend/node_modules"),
        { src: path.resolve(__dirname, "./backend/my-folder"), dest: "my-folder" }
    ],
    buildFiles: () => [
        path.resolve(__dirname, "./backend/package.json"),
        { src: path.resolve(__dirname, "./backend/my-file.txt"), dest: "" } // goes to the root of the build
    ],

    // optional. Provide this if you want this function to update versions
    packageJsons: [
        path.resolve(__dirname, "./lerna.json"),
        path.resolve(__dirname, "./backend/package.json"),
        path.resolve(__dirname, "./frontend/package.json"),
        path.resolve(__dirname, "./shared/package.json")
    ]
})
```
