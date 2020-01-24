import { CSSProperties } from "@material-ui/styles"

export default () => {
    // creates classes from opa1 to opa10
    return {
        scale0: { transform: "scale(0)" } as CSSProperties,
        scale0_25: { transform: "scale(0.25)" } as CSSProperties,
        scale0_5: { transform: "scale(0.5)" } as CSSProperties,
        scale0_75: { transform: "scale(0.5)" } as CSSProperties,
        scaleQuarter: { transform: "scale(0.25)" } as CSSProperties,
        scaleHalf: { transform: "scale(0.5)" } as CSSProperties,
        scaleThreeQuarters: { transform: "scale(0.5)" } as CSSProperties,
        scale1: { transform: "scale(1)" } as CSSProperties,
        scale2: { transform: "scale(2)" } as CSSProperties,
        scale3: { transform: "scale(3)" } as CSSProperties,
        scale4: { transform: "scale(4)" } as CSSProperties,
        rotateX90: { transform: "rotateX(90deg)" } as CSSProperties,
        rotateX180: { transform: "rotateX(180deg)" } as CSSProperties,
        rotateX270: { transform: "rotateX(270deg)" } as CSSProperties,
        flipH: {
            transform: "scaleX(-1)",
            filter: "FlipH"
        },
        flipV: {
            transform: "scaleY(-1)",
            filter: "FlipV"
        },
        scaleX0: { transform: "scaleX(0)" } as CSSProperties,
        scaleX0_25: { transform: "scaleX(0.25)" } as CSSProperties,
        scaleX0_5: { transform: "scaleX(0.5)" } as CSSProperties,
        scaleX0_75: { transform: "scaleX(0.5)" } as CSSProperties,
        scaleXQuarter: { transform: "scaleX(0.25)" } as CSSProperties,
        scaleXHalf: { transform: "scaleX(0.5)" } as CSSProperties,
        scaleXThreeQuarters: { transform: "scaleX(0.5)" } as CSSProperties,
        scaleX1: { transform: "scaleX(1)" } as CSSProperties,
        scaleX2: { transform: "scaleX(2)" } as CSSProperties,
        scaleX3: { transform: "scaleX(3)" } as CSSProperties,
        scaleX4: { transform: "scaleX(4)" } as CSSProperties,

        scaleY0: { transform: "scaleY(0)" } as CSSProperties,
        scaleY0_25: { transform: "scaleY(0.25)" } as CSSProperties,
        scaleY0_5: { transform: "scaleY(0.5)" } as CSSProperties,
        scaleY0_75: { transform: "scaleY(0.5)" } as CSSProperties,
        scaleYQuarter: { transform: "scaleY(0.25)" } as CSSProperties,
        scaleYHalf: { transform: "scaleY(0.5)" } as CSSProperties,
        scaleYThreeQuarters: { transform: "scaleY(0.5)" } as CSSProperties,
        scaleY1: { transform: "scaleY(1)" } as CSSProperties,
        scaleY2: { transform: "scaleY(2)" } as CSSProperties,
        scaleY3: { transform: "scaleY(3)" } as CSSProperties,
        scaleY4: { transform: "scaleY(4)" } as CSSProperties
    }
}
