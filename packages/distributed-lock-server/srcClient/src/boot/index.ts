import Store from "store/Store"

/* import styles */
import "style/fonts/fonts.css"

export default async function boot() {
    await Store.init()
}
