import React from "react"
import { observable, action } from "mobx"
import { observer } from "mobx-react"
import Base from "./Base"
import { isUndefined } from "lodash"
import { Dialog, DialogContent, DialogContentText, TextField, DialogActions } from "@material-ui/core"
import { useRootClasses } from "style"
import Btn from "components/atoms/Btn"
import clsx from "clsx"

interface DialogAction {
    name: string
    fn: (value: string) => Promise<void>
}

interface DialogInfo {
    title: string
    message: string
    image?: string
    cancellable?: boolean
    actions?: DialogAction[]
    withInput?: {
        label: string
        value?: string
        validator?: (input: string) => string | void | boolean
    }
    resolve: (value: string) => void
    reject: () => void
}

type DialogParams = Omit<DialogInfo, "resolve" | "reject">

interface DialogComponentProps {
    dialogStore: Dialogs
}

function validatorResult(value: string, validator: (v: string) => string | void | boolean) {
    const result = validator(value)
    if (typeof result === "string") return result
    else if (result === false) return "Error Occurred"
    return ""
}

export const DialogComponent: React.FC<DialogComponentProps> = observer((props: DialogComponentProps) => {
    const rc = useRootClasses()
    const { dialogStore } = props
    const { currentDialog, next, cancel } = dialogStore
    if (!currentDialog) {
        return <div />
    }

    const setValue = (value: string) => {
        const validator = currentDialog && currentDialog.withInput && currentDialog.withInput.validator
        dialogStore.currentValue = value
        if (!validator) {
            dialogStore.currentError = ""
        } else {
            dialogStore.currentError = validatorResult(value, validator)
        }
    }

    const doAction = async (actionFn: (value: string) => Promise<void>) => {
        try {
            await actionFn(dialogStore.currentValue)
            dialogStore.next()
        } catch (e) {
            dialogStore.currentError = e.message || "Error Occurred"
        }
    }

    const dialogActions: JSX.Element[] = []

    let dialogTitle
    let dialogMessage
    let dialogTextField
    let image

    if (currentDialog && currentDialog.title) {
        dialogTitle = (
            <>
                <h6>{currentDialog.title}</h6>
                <div style={{ height: 1, width: "100%" }} className={rc.bgPrimary} />
            </>
        )
    }

    if (currentDialog && currentDialog.image) {
        image = (
            <img alt="img" src={currentDialog.image} style={{ border: "solid 1px", borderRadius: 4, objectFit: "contain", maxWidth: 130, marginRight: 8 }} />
        )
    }

    dialogMessage = <DialogContentText>{(currentDialog && currentDialog.message) || ""}</DialogContentText>

    const hasNoActions = !currentDialog.actions || !currentDialog.actions.length

    const hasCancelButton = currentDialog.cancellable === true || currentDialog.cancellable === undefined || hasNoActions
    const hasDefaultSubmitButton = !!currentDialog.withInput && hasNoActions

    if (hasCancelButton) {
        dialogActions.push(
            <Btn key="close" aria-label="close" color="inherit" onClick={cancel}>
                Cancel
            </Btn>
        )
    }

    if (hasDefaultSubmitButton) {
        dialogActions.push(
            <Btn key="submit" color="primary" variant="contained" onClick={next} disabled={!!dialogStore.currentError}>
                Submit
            </Btn>
        )
    }

    if (currentDialog.actions) {
        currentDialog.actions.forEach((action, idx) => {
            dialogActions.push(
                <Btn key={idx} color="primary" variant="contained" onClick={() => doAction(action.fn)} disabled={!!dialogStore.currentError}>
                    {action.name}
                </Btn>
            )
        })
    }

    if (currentDialog.withInput) {
        dialogTextField = (
            <TextField
                autoFocus
                margin="dense"
                label={currentDialog.withInput.label}
                fullWidth
                value={dialogStore.currentValue}
                onChange={e => setValue(e.target.value)}
            />
        )
    }

    return (
        <Dialog open={!!currentDialog} onClose={cancel}>
            <DialogContent style={{ padding: "8px 16px" }}>
                <div className={clsx(rc.row)}>
                    {image}

                    <div className={clsx(rc.column)}>
                        {dialogTitle}
                        {dialogMessage}
                        {dialogTextField}
                        <div className={rc.colorError}>{dialogStore.currentError}</div>
                    </div>
                </div>
            </DialogContent>
            <DialogActions style={{ justifyContent: "space-between", padding: "8px 16px" }} className={clsx(rc.row, rc.justifyBetween)}>
                {dialogActions}
            </DialogActions>
        </Dialog>
    )
})

export default class Dialogs extends Base {
    _getters = ["displayName"]

    @observable
    currentDialog?: DialogInfo

    @observable
    currentValue: string = ""

    @observable
    currentError: string = ""

    @observable
    queue: DialogInfo[] = []

    @action
    create(info: DialogParams): Promise<string> {
        return new Promise((resolve, reject) => {
            const newDialog: DialogInfo = {
                title: info.title || "Dialog",
                message: info.message || "",
                image: info.image || "",
                cancellable: isUndefined(info.cancellable) ? true : info.cancellable,
                withInput: info.withInput,
                actions: info.actions,
                resolve,
                reject
            }

            this.queue.push(newDialog)
            if (!this.currentDialog) {
                this.next()
            }
        })
    }

    @action
    next = () => {
        if (this.currentDialog) {
            this.currentDialog.resolve(this.currentValue)
        }

        this.currentError = ""
        this.currentValue = ""
        this.currentDialog = this.queue.shift()
        if (this.currentDialog) {
            if (!!this.currentDialog.withInput) {
                this.currentValue = this.currentDialog.withInput.value || ""
                if (this.currentDialog.withInput.validator) {
                    this.currentError = validatorResult(this.currentValue, this.currentDialog.withInput.validator)
                }
            }
        }
    }

    @action
    cancel = () => {
        if (this.currentDialog) {
            this.currentDialog.reject()
            this.currentDialog = undefined
            this.next()
        }
    }
}
