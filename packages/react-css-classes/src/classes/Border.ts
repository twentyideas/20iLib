import { CSSProperties } from "@material-ui/styles"

export default () => {
    return {
        bordered: { border: "solid 1px" } as CSSProperties,
        roundedBorder: { borderRadius: "5px !important" } as CSSProperties,
        flatBorder: { borderRadius: "0 !important" } as CSSProperties,
        circleBorder: { borderRadius: "50% !important" } as CSSProperties
    }
}
