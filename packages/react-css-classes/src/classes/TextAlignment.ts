import { CSSProperties } from "@material-ui/styles"

export default () => {
    return {
        textLeft: { textAlign: "left" } as CSSProperties,
        textCenter: { textAlign: "center" } as CSSProperties,
        textRight: { textAlign: "right" } as CSSProperties,
        textNoWrap: { whiteSpace: "nowrap" } as CSSProperties,
        ellipsis: { textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" } as CSSProperties
    }
}
