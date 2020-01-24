import { CSSProperties } from "@material-ui/styles"

const getShadow = (n: number) => {
    const n1 = n / 10
    const n2 = n1 - 0.6
    const n3 = n1 - 0.8

    const shadow = [`0px 2px 4px -1px rgba(0,0,0,${n1})`, `0px 4px 5px 0px rgba(0,0,0,${n2})`, `0px 1px 10px 0px rgba(0,0,0,${n3})`].join(",")
    return {
        boxShadow: shadow,
        WebkitBoxShadow: shadow,
        MoxBoxShadow: shadow
    } as CSSProperties
}

export default () => {
    return {
        shadow: getShadow(1),
        shadow1: getShadow(1),
        shadow2: getShadow(2),
        shadow3: getShadow(3),
        shadow4: getShadow(4),
        shadow5: getShadow(5),
        shadow6: getShadow(6),
        shadow7: getShadow(7),
        shadow8: getShadow(8),
        shadow9: getShadow(9)
    }
}
