import React from "react"
import { observable, action } from "mobx"
import Base from "./Base"
import { Store } from "../Store"
import { observer } from "mobx-react"
import { Button, Icon, Snackbar } from "@material-ui/core"
import Slide from "@material-ui/core/Slide"
import { TransitionProps } from "@material-ui/core/transitions/transition"

interface ToastComponentProps {
    toastStore: Toasts
}

function SlideTransition(props: TransitionProps) {
    return <Slide {...props} direction="up" />
}

export const ToastComponent: React.FC<ToastComponentProps> = observer((props: ToastComponentProps) => {
    const { currentToast, next } = props.toastStore

    return (
        <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            open={!!currentToast}
            autoHideDuration={(currentToast && currentToast.duration) || 3000}
            onClose={next}
            TransitionComponent={SlideTransition}
            ContentProps={{ "aria-describedby": "message-id" }}
            message={<span id="message-id">{(currentToast && currentToast.message) || ""}</span>}
            action={[
                <Button key="close" aria-label="close" color="inherit" onClick={next}>
                    <Icon>close</Icon>
                </Button>
            ]}
            color={(currentToast && currentToast.color) || "primary"}
        />
    )
})

interface ToastInfo {
    message: string
    color: "primary" | "secondary" | "error"
    duration: number
    position: ["bottom" | "center" | "top", "left" | "center" | "right"]
}

export default class Toasts extends Base {
    @observable
    currentToast?: ToastInfo

    @observable
    queue: ToastInfo[] = []

    async init(store: Store) {
        await super.init(store)
        return Promise.resolve()
    }

    @action
    next = () => {
        this.currentToast = this.queue.shift()
    }

    @action
    message = (toastParams: Partial<ToastInfo> | string) => {
        if (typeof toastParams === "string") {
            const info = {
                message: toastParams,
                color: "primary",
                duration: 3000,
                position: ["bottom", "center"]
            } as ToastInfo

            if (this.currentToast) {
                this.queue.push(info)
            } else {
                this.currentToast = info
            }
            return
        }

        if (!toastParams.message) {
            throw new Error(`Cannot create a toast without a message!`)
        }

        const info = {
            message: toastParams.message,
            color: toastParams.color || "primary",
            duration: toastParams.duration || 3000,
            position: toastParams.position || ["bottom", "center"]
        } as ToastInfo

        if (this.currentToast) {
            this.queue.push(info)
        } else {
            this.currentToast = info
        }
    }
}
