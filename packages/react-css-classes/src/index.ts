import { makeStyles, Theme as MuiTheme } from "@material-ui/core/styles"
import jss from "jss"
import jssPluginGlobal from "jss-plugin-global"

import Animation from "./classes/Animation"
import Border from "./classes/Border"
import Color from "./classes/Color"
import Flex from "./classes/Flex"
import Handy from "./classes/Handy"
import MarginPadding from "./classes/MarginPadding"
import Opacity from "./classes/Opacity"
import Positional from "./classes/Positional"
import Shadow from "./classes/Shadow"
import Transform from "./classes/Transform"
import TextAlignment from "./classes/TextAlignment"

jss.use(jssPluginGlobal())

export function useClasses(theme: MuiTheme) {
    return makeStyles({
        /* make sure the headers & font matches what we told MUI */
        "@global": {
            body: {
                fontFamily: theme.typography.fontFamily
            },
            h1: { ...theme.typography.h1, margin: 0 },
            h2: { ...theme.typography.h2, margin: 0 },
            h3: { ...theme.typography.h3, margin: 0 },
            h4: { ...theme.typography.h4, margin: 0 },
            h5: { ...theme.typography.h5, margin: 0 },
            h6: { ...theme.typography.h6, margin: 0 },

            "::-webkit-scrollbar-button": { display: "none" },
            "::-webkit-scrollbar-thumb": {
                backgroundColor: theme.palette.primary.main,
                borderRadius: 8,
                border: "4px solid rgba(0, 0, 0, 0)",
                backgroundClip: "padding-box"
            },
            "::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
            "::-webkit-scrollbar-track": { display: "none" },
            "::-webkit-scrollbar": { width: 16, height: 16 }
        },
        ...Border(),
        ...Color(theme.palette),
        ...Flex(),
        ...Handy(),
        ...MarginPadding(theme.spacing),
        ...Opacity(),
        ...Positional(),
        ...TextAlignment(),
        ...Shadow(),
        ...Animation(),
        ...Transform()
    })
}
