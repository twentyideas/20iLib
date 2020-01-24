import { CSSProperties } from "@material-ui/styles"

export default () => {
    // creates flex classes
    return {
        row: { display: "flex", flexFlow: "row", flexWrap: "nowrap" } as CSSProperties,
        column: { display: "flex", flexFlow: "column", flexWrap: "nowrap" } as CSSProperties,
        wrap: { flexWrap: "wrap" } as CSSProperties,
        noWrap: { flexWrap: "nowrap" } as CSSProperties,
        itemsStart: { alignItems: "flex-start" } as CSSProperties,
        itemsCenter: { alignItems: "center" } as CSSProperties,
        itemsEnd: { alignItems: "flex-end" } as CSSProperties,
        itemsStretch: { alignItems: "stretch" } as CSSProperties,

        justifyStart: { justifyContent: "flex-start" } as CSSProperties,
        justifyCenter: { justifyContent: "center" } as CSSProperties,
        justifyEnd: { justifyContent: "flex-end" } as CSSProperties,
        justifyBetween: { justifyContent: "space-between" } as CSSProperties,
        justifyEvenly: { justifyContent: "space-evenly" } as CSSProperties,
        justifyStretch: { justifyContent: "stretch" } as CSSProperties,

        selfStart: { alignSelf: "flex-start" } as CSSProperties,
        selfCenter: { alignSelf: "center" } as CSSProperties,
        selfEnd: { alignSelf: "flex-end" } as CSSProperties,
        selfStretch: { alignSelf: "stretch" } as CSSProperties,

        flexGrow: { flexGrow: 1 } as CSSProperties,
        flexShrink: { flexShrink: 1 } as CSSProperties
    }
}
