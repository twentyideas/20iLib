/* SelectedProjectApiKeyControls auto-generated by npm run generator */
import { Theme } from "@material-ui/core"
import { makeStyles, CSSProperties } from "@material-ui/styles"
import { observer } from "mobx-react"
import clsx from "clsx"
import React from "react"
import Store from "store/Store"
import { useRootClasses } from "style"
import Btn from "components/atoms/Btn"

interface SelectedProjectApiKeyControlsProps {
    className?: string
    style?: CSSProperties
    children?: React.ReactNode
}

const useStyles = makeStyles((theme: Theme) => ({
    selectedProjectApiKeyControlsOrganism: {},
    row: {
        padding: theme.spacing(2),
        border: "solid 1px"
    }
}))

const SelectedProjectApiKeyControls: React.FC<SelectedProjectApiKeyControlsProps> = props => {
    const classes = useStyles()
    const rc = useRootClasses()
    const className = clsx(classes.selectedProjectApiKeyControlsOrganism, props.className, rc.column, rc.itemsStretch)
    // your code here

    const rows = Store.distributedLock.state.selectedProjectApiKeys.map((apiKey, idx) => {
        return (
            <div key={idx} className={clsx(rc.row, rc.justifyBetween, rc.itemsCenter, classes.row)}>
                <div>{apiKey}</div>
                <Btn size="small" className={clsx(rc.colorCommonWhite, rc.bgError)} onClick={() => Store.distributedLock.actions.deleteApiKey(apiKey)}>
                    Revoke
                </Btn>
            </div>
        )
    })

    return (
        <div className={className} style={props.style}>
            {rows}
            <Btn className={rc.mt2} onClick={() => Store.distributedLock.actions.createApiKey()}>
                + Create
            </Btn>
        </div>
    )
}

export default observer(SelectedProjectApiKeyControls)