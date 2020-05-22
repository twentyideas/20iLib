import { every, isArray, isString, reduce } from "lodash"

const toFirebaseDict = [
    [Infinity, "!!!Infinity!!!"],
    [Infinity, "Infinity"],
    [undefined, "!!!Undefined!!!"]
]

const fromFirebaseDict = toFirebaseDict.map(arr => arr.slice().reverse())
const NESTED_ARRAY_IDENTIFIER = "!!!Contents!!!"
const primitiveTypes = ["string", "number", "boolean"]

function isPrimitive(obj: any) {
    return primitiveTypes.includes(typeof obj) || obj instanceof Date || obj === null || obj === undefined
}

/* whenever writing to fb, make sure to use this */
const transformFns = {
    serializeNestedArrays(obj: any) {
        if (isPrimitive(obj)) {
            return obj
        }

        const starterObj = isArray(obj) ? [] : {}
        return reduce(
            obj,
            (acc: any, value, key) => {
                if (isPrimitive(value)) {
                    acc[key] = value
                } else if (!isArray(value)) {
                    acc[key] = transformFns.serializeNestedArrays(value)
                } else {
                    const isNestedArray = every(value, isArray)
                    if (isNestedArray) {
                        acc[key] = value.map(v => ({ [NESTED_ARRAY_IDENTIFIER]: transformFns.serializeNestedArrays(v) }))
                    } else {
                        acc[key] = value.map(v => transformFns.serializeNestedArrays(v))
                    }
                }
                return acc
            },
            starterObj
        )
    },
    deserializeNestedArrays(obj: any) {
        if (isPrimitive(obj)) {
            return obj
        }

        const starterObj = isArray(obj) ? [] : {}
        return reduce(
            obj,
            (acc: any, value, key) => {
                if (isPrimitive(value)) {
                    acc[key] = value
                } else if (!isArray(value)) {
                    acc[key] = transformFns.deserializeNestedArrays(value)
                } else {
                    const changed = every(value, v => v[NESTED_ARRAY_IDENTIFIER])
                    if (changed) {
                        acc[key] = value.map(v => transformFns.deserializeNestedArrays(v[NESTED_ARRAY_IDENTIFIER]))
                    } else {
                        acc[key] = transformFns.deserializeNestedArrays(value)
                    }
                }
                return acc
            },
            starterObj
        )
    },
    deserialize(obj: any, dict: any[][]) {
        const object = transformFns.deserializeNestedArrays(obj)
        const search = (dict || []).map(arr => arr[0])
        const replace = (dict || []).map(arr => arr[1])
        const str = isString(object) ? object : JSON.stringify(object)
        return JSON.parse(str, (key, value) => {
            const searchIdx = search.indexOf(value)
            return searchIdx !== -1 ? replace[searchIdx] : value
        })
    },
    serialize(obj: any, dict: any[][]) {
        const object = transformFns.serializeNestedArrays(obj)
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
