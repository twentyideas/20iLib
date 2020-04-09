import React from "react"
import { Router } from "@reach/router"
import { Route, RouteInfo } from "./Route"
import MainLayout from "components/organisms/Layout/MainLayout"
import Home from "pages/Home"
import { keys, values, find, every, toLower, capitalize } from "lodash"

interface RouterProps {
    className?: string
    style?: React.CSSProperties
}

const navigationGuards = {
    layout: (to: RouteInfo, from?: RouteInfo): Promise<string | boolean> => {
        return new Promise(resolve => {
            if (to && (to.fullPath === "/*" || to.fullPath === "/")) {
                return resolve(`/home`)
            }
            return resolve(true)
        })
    },
    app: async (to: RouteInfo, from?: RouteInfo): Promise<string | boolean> => {
        // do auth & other checks here
        return true
    }
}

export const PATHS = {
    ROOT: () => "/*",
    HOME: () => "home"
}

export function getPageName(PATH: string) {
    const path = PATH.startsWith("/") ? PATH.slice(1) : PATH
    const pieces = path.split("/")

    const pathNames = keys(PATHS)
    const pathValues = values(PATHS)
        .map(fn => fn())
        .map(p => (p.startsWith("/") ? p.slice(1) : p))

    const matchingPathName = find(pathNames, (name: string, idx: number) => {
        const pathPieces = pathValues[idx].split("/")
        return every(pieces, (piece: string, pieceIdx: number) => {
            const pathPiece = pathPieces[pieceIdx]
            if (!pathPiece) {
                return false
            }

            if (pathPiece.startsWith(":")) {
                return true
            }

            return piece === pathPiece
        })
    })

    if (!matchingPathName) {
        return "MT Game"
    }

    return matchingPathName
        .split("_")
        .map(toLower)
        .map(capitalize)
        .join(" ")
}

const Layout: React.FC<RouterProps> = props => (
    <Router className={props.className} style={props.style}>
        <Route path={PATHS.ROOT()} guard={navigationGuards.layout} component={MainLayout} />
    </Router>
)

const Main: React.FC<RouterProps> = props => (
    <Router className={props.className} style={props.style}>
        <Route guard={navigationGuards.app} path={PATHS.HOME()} component={Home} />
    </Router>
)

export const AppRouter = { Layout, Main }
