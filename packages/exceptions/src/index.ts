import { flatten, isArray, every } from "lodash"

export interface IException {
    name: string
    code: number
    message: string | IException[]
}

export const BadRequest = (badRequestReason: string): IException => ({ name: "badRequest", code: 400, message: badRequestReason })
export const Unauthorized = (unAuthorizedReason: string): IException => ({ name: "unauthorized", code: 401, message: unAuthorizedReason })
export const Forbidden = (forbiddenReason: string): IException => ({ name: "forbidden", code: 403, message: forbiddenReason })
export const NotFound = (message: string): IException => ({ name: "notFound", code: 404, message })
export const InternalError = (message: string): IException => ({ name: "internalError", code: 500, message })

export const GetErrorMessage = (exception: IException): string[] => {
    if (typeof exception.message === "string") {
        return [exception.message]
    } else {
        const errors = exception.message.map(GetErrorMessage)
        return flatten(errors)
    }
}

export const IsException = (obj: any): obj is IException => {
    if (!obj) {
        return false
    }

    if (typeof obj.name !== "string") {
        return false
    }

    if (typeof obj.code !== "number") {
        return false
    }

    if (typeof obj.message === "string") {
        return true
    }

    return isArray(obj.message) && every(obj.message, IsException)
}
