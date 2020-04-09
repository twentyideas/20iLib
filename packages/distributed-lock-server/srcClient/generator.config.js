const path = require('path')

module.exports = {
    PATHS: {
        ATOMS: path.resolve(__dirname, "./src/components/atoms"),
        MOLECULES: path.resolve(__dirname, "./src/components/molecules"),
        ORGANISMS: path.resolve(__dirname, "./src/components/organisms"),
        PAGES: path.resolve(__dirname, "./src/pages"),
        STORE_MODULES: path.resolve(__dirname, "./src/store/modules")
    }
}