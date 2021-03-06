/* HomePage auto-generated by npm run generator */
import { RouteComponentProps } from "@reach/router"
import { Theme } from "@material-ui/core"
import { makeStyles } from "@material-ui/styles"
import { observer } from "mobx-react"
import React from "react"
import Store from "store/Store"
import ServerPicker from "components/organisms/ServerPicker"
import { SERVER } from "store/modules/DistributedLock"
import ProjectPicker from "components/organisms/ProjectPicker"
import SelectedProjectControls from "components/organisms/SelectedProjectControls"

interface HomePageProps {}

const useStyles = makeStyles((theme: Theme) => ({
    homePagePage: {}
}))

const HomePage: React.FC<RouteComponentProps<HomePageProps>> = props => {
    const classes = useStyles()
    return (
        <div className={classes.homePagePage}>
            <ServerPicker x-if={Store.distributedLock.server === SERVER.NONE} />
            <div x-else-if={!!Store.distributedLock.state.apiKey}>
                <h5>Server: {Store.distributedLock.server}</h5>
                <ProjectPicker x-if={!Store.distributedLock.selectedProject} />
                <SelectedProjectControls x-else />
            </div>
        </div>
    )
}

export default observer(HomePage)
