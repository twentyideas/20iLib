import { Store } from "../Store"
export default class Base {
   store?: Store = undefined
   async init(store: Store) {
       this.store = store
       return Promise.resolve()
   }
}