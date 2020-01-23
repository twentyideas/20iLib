const containsWhitespace = (str: string) => str.indexOf(" ") !== -1
const containsNumbers = (str: string) => str.match(/[0-9]/g) !== null
const containsAlphabets = (str: string) => str.match(/[a-z]/g) !== null
const isOnlyAlphanumeric = (str: string) => str.match(/^[0-9a-zA-Z]+$/) !== null
const isOnlyAlpha = (str: string) => str.match(/^[a-zA-Z]+$/) !== null
const isOnlyNumeric = (str: string) => str.match(/^([0-9])+([.])*([0-9])+$/) !== null
const isInteger = (str: string) => str.match(/^[0-9]+$/g) !== null
const replace = (source: string, search: string, replacement: string) => source.replace(new RegExp(search, "g"), replacement)

export { containsWhitespace, containsNumbers, containsAlphabets, isOnlyAlphanumeric, isOnlyNumeric, isOnlyAlpha, isInteger, replace }
