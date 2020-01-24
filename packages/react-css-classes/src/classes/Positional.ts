import { CSSProperties } from "@material-ui/styles"

export default () => {
    return {
        vMiddle: { verticalAlign: "middle" } as CSSProperties,
        relative: { position: "relative" } as CSSProperties,
        absolute: { position: "absolute", left: 0, top: 0 } as CSSProperties,
        fixed: { position: "fixed" } as CSSProperties
    }
}
