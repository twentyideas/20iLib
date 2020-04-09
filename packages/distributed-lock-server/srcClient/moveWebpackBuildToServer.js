const scripts = require('@20i/scripts')
const path = require('path')

const PATHS = {
    FROM: path.resolve(__dirname, "./build"),
    TO: path.resolve(__dirname, "../../distributed-lock-server/build/buildSite")
}

scripts.helpers.file.copyDir(PATHS.FROM, PATHS.TO)