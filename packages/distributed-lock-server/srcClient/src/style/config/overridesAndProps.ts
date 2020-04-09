import { Overrides } from "@material-ui/core/styles/overrides"
import { ComponentsProps } from "@material-ui/core/styles/props"

export const overrides: Overrides = {
    MuiFab: {
        root: {
            boxShadow: "none"
        },
        label: {
            fontWeight: "bold",
            lineHeight: "16px",
            letterSpacing: "1.3px",
            paddingLeft: 10,
            paddingRight: 10
        }
    }
}
export const props: ComponentsProps = {
    MuiFab: {
        size: "small",
        variant: "extended",
        color: "primary"
    }
}
