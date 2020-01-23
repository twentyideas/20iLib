# @20i/exceptions

Provides standard exceptions to throw.
We should add to this simple library when we wish to add more.

Examples:
1) Throw one error:
```
import * as Exception from "@20i/exceptions"

throw Exception.BadRequest("This was a bad request")
// throws { name: "badRequest", code: 400, message: "This was a bad request" }

throw Exception.Unauthorized("You must be logged in to do this")
// throws { name: "unauthorized", code: 401, message: "You must be logged in to do this" }

throw Exception.Forbidden("You do not have permission")
// throws { name: "forbidden", code: 403, message: "You do not have permission" }

throw Exception.NotFound("The record was not found")
// throws { name: "notFound", code: 404, "The record was not found" }

throw Exception.InternalError("Unexpected error")
// throws { name: "internalError", code: 500, "Unexpected error" }
```

2) Throw multiple errors
```
import * as Exception from "@20i/exceptions"

const exceptions: Exception.IException = {
    name: "multipleErrors",
    code: 400,
    message: [
        Exception.BadRequest("This was a bad request"),
        Exception.Unauthorized("You must be logged in to do this"),
        Exception.Forbidden("You do not have permission"),
        Exception.NotFound("The record was not found"),
        Exception.InternalError("Unexpected error")
    ]
}

// reading the text from exceptions
console.log(Exception.GetErrorMessage(exceptions))
// [
//    "This was a bad request",
//    "You must be logged in to do this",
//    "You do not have permission",
//    "The record was not found",
//    "Unexpected error"
// ]
```

3) Axios example
```
import * as Exception from "@20i/exceptions"
import axios, { AxiosResponse } from "axios"

const axiosCall = () => {
    try {
        const response = await axios.get("http://your-url-here.com")
        return response.data
    } catch (e) {
        const res: AxiosResponse = e.response.data
        if (Exception.isException(res)) {
            // print what the message(s)
            Exception.GetErrorMessage(res)
        }
        throw res
    }
}


```