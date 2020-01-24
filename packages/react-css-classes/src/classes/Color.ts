import { CSSProperties } from "@material-ui/styles"
import { Palette } from "@material-ui/core/styles/createPalette"

export default (palette: Palette) => {
    return {
        colorPrimary: { color: `${palette.primary.main} !important` } as CSSProperties,
        colorPrimaryLight: { color: `${palette.primary.light} !important` } as CSSProperties,
        colorPrimaryDark: { color: `${palette.primary.dark} !important` } as CSSProperties,
        colorPrimaryContrast: { color: `${palette.primary.contrastText} !important` } as CSSProperties,
        colorSecondary: { color: `${palette.secondary.main} !important` } as CSSProperties,
        colorSecondaryLight: { color: `${palette.secondary.light} !important` } as CSSProperties,
        colorSecondaryDark: { color: `${palette.secondary.dark} !important` } as CSSProperties,
        colorSecondaryContrast: { color: `${palette.secondary.contrastText} !important` } as CSSProperties,
        colorError: { color: `${palette.error.main} !important` } as CSSProperties,
        colorErrorLight: { color: `${palette.error.light} !important` } as CSSProperties,
        colorErrorDark: { color: `${palette.error.dark} !important` } as CSSProperties,
        colorErrorContrast: { color: `${palette.error.contrastText} !important` } as CSSProperties,
        colorCommonWhite: { color: `${palette.common.white} !important` } as CSSProperties,
        colorCommonBlack: { color: `${palette.common.black} !important` } as CSSProperties,
        colorBackground: { color: `${palette.background.default} !important` } as CSSProperties,
        colorBackgroundPaper: { color: `${palette.background.paper} !important` } as CSSProperties,

        colorText: { color: `${palette.text.primary} !important` } as CSSProperties,
        colorTextSecondary: { color: `${palette.text.secondary} !important` } as CSSProperties,
        colorTextHint: { color: `${palette.text.hint} !important` } as CSSProperties,
        colorTextDisabled: { color: `${palette.text.disabled} !important` } as CSSProperties,

        bgPrimary: { backgroundColor: `${palette.primary.main} !important` } as CSSProperties,
        bgPrimaryLight: { backgroundColor: `${palette.primary.light} !important` } as CSSProperties,
        bgPrimaryDark: { backgroundColor: `${palette.primary.dark} !important` } as CSSProperties,
        bgPrimaryContrast: { backgroundColor: `${palette.primary.contrastText} !important` } as CSSProperties,
        bgSecondary: { backgroundColor: `${palette.secondary.main} !important` } as CSSProperties,
        bgSecondaryLight: { backgroundColor: `${palette.secondary.light} !important` } as CSSProperties,
        bgSecondaryDark: { backgroundColor: `${palette.secondary.dark} !important` } as CSSProperties,
        bgSecondaryContrast: { backgroundColor: `${palette.secondary.contrastText} !important` } as CSSProperties,
        bgError: { backgroundColor: `${palette.error.main} !important` } as CSSProperties,
        bgErrorLight: { backgroundColor: `${palette.error.light} !important` } as CSSProperties,
        bgErrorDark: { backgroundColor: `${palette.error.dark} !important` } as CSSProperties,
        bgErrorContrast: { backgroundColor: `${palette.error.contrastText} !important` } as CSSProperties,

        bgCommonWhite: { backgroundColor: `${palette.common.white} !important` } as CSSProperties,
        bgCommonBlack: { backgroundColor: `${palette.common.black} !important` } as CSSProperties,

        bgBackground: { backgroundColor: `${palette.background.default} !important` } as CSSProperties,
        bgBackgroundPaper: { backgroundColor: `${palette.background.paper} !important` } as CSSProperties,

        bgText: { backgroundColor: `${palette.text.primary} !important` } as CSSProperties,
        bgTextSecondary: { backgroundColor: `${palette.text.secondary} !important` } as CSSProperties,
        bgTextHint: { backgroundColor: `${palette.text.hint} !important` } as CSSProperties,
        bgTextDisabled: { backgroundColor: `${palette.text.disabled} !important` } as CSSProperties
    }
}
