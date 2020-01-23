import { isString } from "lodash"

const toFirebaseDict = [
    [Infinity, "!!!Infinity!!!"],
    [Infinity, "Infinity"],
    [undefined, "!!!Undefined!!!"]
]

const fromFirebaseDict = toFirebaseDict.map(arr => arr.slice().reverse())

/* whenever writing to fb, make sure to use this */
const transformFns = {
    deserialize(object: any, dict: any[][]) {
        const search = (dict || []).map(arr => arr[0])
        const replace = (dict || []).map(arr => arr[1])
        const str = isString(object) ? object : JSON.stringify(object)
        return JSON.parse(str, (key, value) => {
            const searchIdx = search.indexOf(value)
            return searchIdx !== -1 ? replace[searchIdx] : value
        })
    },
    serialize(object: any, dict: any[][]) {
        const search = (dict || []).map(arr => arr[0])
        const replace = (dict || []).map(arr => arr[1])
        const str = JSON.stringify(object, (key, value) => {
            const searchIdx = search.indexOf(value)
            return searchIdx !== -1 ? replace[searchIdx] : value
        })

        return JSON.parse(str)
    },

    OUT(obj: any) {
        return transformFns.serialize(obj, toFirebaseDict)
    },

    IN(obj: any) {
        return transformFns.deserialize(obj, fromFirebaseDict)
    }
}

export const { IN, OUT } = transformFns
