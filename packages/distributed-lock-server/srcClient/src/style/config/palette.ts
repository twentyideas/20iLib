import { PaletteOptions } from "@material-ui/core/styles/createPalette"

const palette: PaletteOptions = {
    common: { black: "#000", white: "#fff" },
    background: { paper: "#fff", default: "#fafafa" },
    primary: {
        light: "#dff2ff ",
        main: "#065a7a",
        dark: "#044861",
        contrastText: "#fff"
    },
    secondary: {
        light: "#FCE5A7",
        main: "#fcc505",
        contrastText: "#044861"
    },
    error: {
        light: "#e57373",
        main: "#f44336",
        dark: "#d32f2f",
        contrastText: "#fff"
    },
    text: {
        primary: "#044861",
        secondary: "#065a7a",
        disabled: "#dff2ff ",
        hint: "#dff2ff "
    }
}
export default palette
