// eslint-disable-next-line
import React from "react"
import ReactDOM from "react-dom"
import { ThemeProvider } from "@material-ui/styles"
import { observer } from "mobx-react"
import CssBaseLine from "@material-ui/core/CssBaseline"
import boot from "./boot"
import { AppRouter } from "./Router"
import * as serviceWorker from "./serviceWorker"
import Store from "store/Store"
import { ToastComponent } from "store/modules/Toasts"
import { DialogComponent } from "store/modules/Dialogs"
import Debug from "components/organisms/Debug/Debug"

async function main() {
    await boot()

    const rootElement = document.getElementById("root")
    const LayoutRouter = AppRouter.Layout

    const App = observer(() => (
        <ThemeProvider theme={Store.appContext.state.theme}>
            <CssBaseLine />
            <DialogComponent dialogStore={Store.dialogs} />
            <ToastComponent toastStore={Store.toasts} />
            <LayoutRouter />
            <Debug />
        </ThemeProvider>
    ))

    ReactDOM.render(<App />, rootElement)

    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://bit.ly/CRA-PWA
    serviceWorker.unregister()
}

main()
