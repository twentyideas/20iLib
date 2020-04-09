import { createMuiTheme } from "@material-ui/core/styles"
import breakpoints from "./config/breakpoints"
import { overrides, props } from "./config/overridesAndProps"
import palette from "./config/palette"
import spacing from "./config/spacing"
import typography from "./config/typography"
import { useClasses } from "@20i/react-css-classes"

export const Theme = createMuiTheme({
    typography,
    palette,
    breakpoints,
    spacing,
    overrides,
    props
})

export const useRootClasses = useClasses(Theme)
