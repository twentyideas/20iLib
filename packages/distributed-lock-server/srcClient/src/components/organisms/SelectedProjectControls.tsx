/* SelectedProjectControls auto-generated by npm run generator */
import { Theme } from "@material-ui/core"
import { makeStyles, CSSProperties } from "@material-ui/styles"
import { observer } from "mobx-react"
import clsx from "clsx"
import React from "react"
import Store from "store/Store"
import { useRootClasses } from "style"
import Btn from "components/atoms/Btn"
import SelectedProjectApiKeyControls from "./SelectedProjectApiKeyControls"

interface SelectedProjectControlsProps {
    className?: string
    style?: CSSProperties
    children?: React.ReactNode
}

const useStyles = makeStyles((theme: Theme) => ({
    selectedProjectControlsOrganism: {}
}))

const SelectedProjectControls: React.FC<SelectedProjectControlsProps> = props => {
    const classes = useStyles()
    const rc = useRootClasses()
    const className = clsx(classes.selectedProjectControlsOrganism, props.className, rc.column, rc.itemsStretch)

    return (
        <div className={className} style={props.style}>
            <div className={clsx(rc.row, rc.itemsCenter, rc.justifyBetween)}>
                <div className={rc.row}>
                    <Btn size="small" variant="text" onClick={() => Store.distributedLock.actions.setProject("")}>
                        🠈
                    </Btn>
                    <h5>Selected Project: {Store.distributedLock.selectedProject}</h5>
                </div>
                <Btn
                    className={clsx(rc.colorCommonWhite, rc.bgError)}
                    onClick={() => Store.distributedLock.actions.deleteProject(Store.distributedLock.selectedProject)}
                >
                    Delete
                </Btn>
            </div>
            <div className={rc.ml8}>
                <h5>Api Keys</h5>
                <SelectedProjectApiKeyControls />
            </div>
        </div>
    )
}

export default observer(SelectedProjectControls)
