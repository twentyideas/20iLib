import { CSSProperties } from "@material-ui/styles"

export default () => {
    // creates classes from opa1 to opa10
    const keyframes = {
        "@keyframes animation-shake": {
            "0%": { transform: "translateX(0px)" },
            "25%": { transform: "translateX(-10px)" },
            "50%": { transform: "translateX(0px)" },
            "75%": { transform: "translateX(10px)" },
            "100%": { transform: "translateX(0px)" }
        },
        "@keyframes animation-bounce": {
            "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
            "40%": { transform: "translateY(-30px)" },
            "60%": { transform: "translateY(-15px)" }
        },
        "@keyframes animation-level-up": {
            "0%": { filter: "contrast(150%)" },
            "50%": { filter: "contrast(150%)", transform: "scale(1.1)" },
            "100%": { filter: "contrast(150%)" }
        },
        "@keyframes animation-scale-up": {
            "100%": { transform: "scale(1.5)" }
        },
        "@keyframes animation-scale-down": {
            "100%": { transform: "scale(0)", opacity: 0 } as CSSProperties
        },
        "@keyframes animation-scale-spin-down": {
            "100%": { transform: "scale(0) rotate(720deg)", opacity: 0 } as CSSProperties
        },
        "@keyframes animation-breathe": {
            "0%": { transform: "scale(0.9)" },
            "25%": { transform: "scale(1)" },
            "60%": { transform: "scale(0.9)" },
            "100%": { transform: "scale(0.9)" }
        },
        "@keyframes animation-scale-half": {
            "100%": { transform: "scale(0.5)" } as CSSProperties
        }
    }
    const classes = {
        animationShake: {
            animation: "$animation-shake linear 0.25s infinite"
        },
        animationBounce: {
            animation: "$animation-bounce linear 1s infinite"
        },
        animationLevelUp: {
            animation: "$animation-level-up linear 0.25s infinite"
        },
        animationScaleUp: {
            animation: "$animation-scale-up linear 1s"
        },
        animationScaleDown: {
            animation: "$animation-scale-down linear 1s"
        },
        animationScaleHalf: {
            animation: "$animation-scale-half linear 1s"
        },
        animationScaleSpinDown: {
            animation: "$animation-scale-spin-down linear 1s"
        },
        animationBreathe: {
            animation: "$animation-breathe 3s linear infinite"
        }
    }

    return { ...keyframes, ...classes }
}
