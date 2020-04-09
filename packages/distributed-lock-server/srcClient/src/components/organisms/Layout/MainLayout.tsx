/* Main auto-generated by npm run generator */
import { RouteComponentProps } from "@reach/router"
import { Theme } from "@material-ui/core"
import { makeStyles, CSSProperties } from "@material-ui/styles"
import { observer } from "mobx-react"
import clsx from "clsx"
import React from "react"
import { AppRouter } from "Router"
import { useRootClasses } from "style"

/* this is really a page */
interface MainLayoutProps {
    className?: string
    style?: CSSProperties
    children?: React.ReactNode
}

const useStyles = makeStyles((theme: Theme) => ({
    mainLayout: {
        width: "100vw",
        height: "100vh",
        background: theme.palette.common.white
    },
    topBar: {
        flex: `0 0 ${theme.spacing(8)}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    mainRouter: {
        background: theme.palette.background.default,
        paddingTop: theme.spacing(1),
        flex: `0 0 calc(100vh - ${theme.spacing(8)}px)`
    }
}))

const MainLayout: React.FC<RouteComponentProps<MainLayoutProps>> = props => {
    const classes = useStyles()
    const rootClasses = useRootClasses()
    const className = clsx(classes.mainLayout, props.className, rootClasses.column, rootClasses.overflowHidden)

    const MainRouter = AppRouter.Main

    return (
        <div className={className}>
            <div className={classes.topBar}>
                <h5>Distributed Lock Admin</h5>
            </div>
            <MainRouter className={clsx(classes.mainRouter, rootClasses.overflowAuto, rootClasses.ph1)} />
        </div>
    )
}

export default observer(MainLayout)
