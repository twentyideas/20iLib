/* Debug auto-generated by npm run generator */
import MouseTrap from "mousetrap"
import { Theme } from "@material-ui/core"
import { makeStyles, CSSProperties } from "@material-ui/styles"
import { observer } from "mobx-react"
import clsx from "clsx"
import React from "react"
import DebugStore from "./DebugStore"

import { useRootClasses } from "style"

interface DebugProps {
    className?: string
    style?: CSSProperties
}

const useStyles = makeStyles((theme: Theme) => ({
    debugDebugOrganism: {
        width: `100vw`,
        height: `100vh`,
        position: `fixed`,
        left: 0,
        top: 0,
        zIndex: 99999,
        padding: theme.spacing(2),
        background: `rgba(0, 43, 54, 0.5)`
    } as CSSProperties
}))

const Debug: React.FC<DebugProps> = props => {
    const classes = useStyles()
    const rootClasses = useRootClasses()
    const className = clsx(classes.debugDebugOrganism, props.className)

    const [show, setShow] = React.useState(false)
    const toggleShow = () => setShow(!show)

    React.useEffect(() => {
        const mouseTrap = new MouseTrap()
        mouseTrap.bind("f7", toggleShow)
        return () => {
            mouseTrap.unbind("f7")
        }
    })

    if (!show) {
        return <></>
    }

    return (
        <div className={className}>
            <h3 className={clsx(rootClasses.colorCommonWhite, rootClasses.ma0)}>Debug Window</h3>
            <DebugStore className={clsx(rootClasses.mt2)} />
        </div>
    )
}

export default observer(Debug)
