# @20i/firestore-models
Gives standard functions to interact and manipulate collections.
Compatible with both firebase and firebase-admin packages.
You must initialize this library with a valid firebase app or firebase-admin app first.

1) Init (firebase client library)
```
import { init } from ("@20i/firestore-models")
import * as Firebase from "firebase/app"

const fbConfig = {
    apiKey: "YOUR-API-KEY",
    authDomain: "YOUR AUTH DOMAIN",
    databaseURL: "YOUR DATABASE URL",
    projectId: "YOUR PROJECT ID",
    storageBucket: "YOUR STORAGE BUCKET",
    messagingSenderId: "YOUR MESSAGING SENDER ID",
    appId: "YOUR APP ID"
}

const app = Firebase.initializeApp(getFbConfig())
init(app)
```

2) Init (firebase-admin library)
```
import { init } from "@20i/firestore-models"
import * as Firebase from "firebase/app"
import admin, { initializeApp } from "firebase-admin"

const serviceAccount: admin.ServiceAccount = {
    clientEmail: process.env.CLIENT_EMAIL,
    projectId: process.env.PROJECT_ID,
    privateKey: (process.env.PRIVATE_KEY || "").replace(/\\n/g, "\n")
}

const adminApp = await initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
})

init(adminApp)
```

3) Simple Usage
```
import Firebase from "firebase"
import { FirestoreModels, baseRecord, FirebaseModelFns } from "@20i/firestore-models";

export interface User extends FirestoreModels.BaseRecord {
    name: string
    email: string
}

const BlankUser = (partial?: Partial<User>): User => {
    return {
        ...baseRecord(),
        name: "",
        email: "",
        ...partial
    }
}

// tell the library that under the collection name of "user", we want to deal with the User interface/type
export const user = new FirebaseModelFns<User>("user", BlankUser)

// now we can use the following functions on the exported user collection
async function callFnsOnUser() {
    const authUser = Firebase.auth().currentUser

    const newUser = await user.create(authUser, { name: "wolf "})
    await user.exists(authUser, newUser.id)
    await user.find(authUser, [["name", "==", newUser.name]])
    await user.findOne(authUser, [["name", "==", newUser.name]])
    
    await user.get(authUser, "123")
    await user.remove(authUser, "123")
    await user.update(authUser, { id: "123", name: "wolfpack" })
    await user.updateOrCreate(authUser, { id: "123", name: "wolfpack" })
    
    // subscribe to user with id 123
    const unsubFn = user.subscribe("123", user => console.log("User changed", user))
}
```

4) Add validation rules on methods
```
import Firebase, { User as FbAuthUser } from "firebase"
import { FirestoreModels, baseRecord, FirebaseModelFns } from "@20i/firestore-models"

export interface User extends FirestoreModels.BaseRecord {
    name: string
    email: string
}

const BlankUser = (partial?: Partial<User>): User => {
    return {
        ...baseRecord(),
        name: "",
        email: "",
        ...partial
    }
}

const validate = {
    isLoggedIn(currentUser: FbAuthUser | undefined, payload: FirestoreModels.BaseRecord, cannotDo = `Cannot perform action`) {
        if (!currentUser) {
            throw new Error(`${cannotDo} because you are not logged in`)
        }
    },
    payloadHasId(currentUser: FbAuthUser | undefined, payload: FirestoreModels.BaseRecord, cannotDo: string) {
        if (!payload.id) {
            throw new Error(`${cannotDo} because no id is provided`)
        }
    },
    isAuthor(currentUser: FbAuthUser | undefined, payload: FirestoreModels.BaseRecord, cannotDo: string) {
        if (payload.userIdCreated && payload.userIdCreated !== currentUser?.uid) {
            throw new Error(`${cannotDo} because you are not the author`)
        }
    },
}

const userValidation = {
    create: async (payload: LessonType, currentUser?: FbAuthUser) => {
        const cannotDo = `Cannot create user`
        return new Promise((resolve) => setTimeout(resolve, 100))
    },
    update: (payload: User, currentUser?: FbAuthUser) => {
        const cannotDo = `Cannot update user`
        validate.isLoggedIn(currentUser, payload, cannotDo)
        validate.payloadHasId(currentUser, payload, cannotDo)
        validate.isAuthor(currentUser, payload, cannotDo)
    },
    remove: (payload: User, currentUser?: FbAuthUser) => {
        const cannotDo = `Cannot remove user`
        validate.isLoggedIn(currentUser, payload, cannotDo)
        validate.payloadHasId(currentUser, payload, cannotDo)
        validate.isAuthor(currentUser, payload, cannotDo)
    }
}

export const user = new FirebaseModelFns<User>("user", BlankUser, userValidation)

// now we can use the following functions on user collection
async function callFnsOnUser() {
    const authUser = Firebase.auth().currentUser

    const newUser = await user.create(authUser, { name: "wolf "})
    await user.exists(authUser, newUser.id)
    await user.find(authUser, [["name", "==", newUser.name]])
    await user.findOne(authUser, [["name", "==", newUser.name]])
    
    await user.get(authUser, "123")
    await user.remove(authUser, "123")
    await user.update(authUser, { id: "123", name: "wolfpack" })
    await user.updateOrCreate(authUser, { id: "123", name: "wolfpack" })
    
    // subscribe to user with id 123
    const unsubFn = user.subscribe("123", user => console.log("User changed", user))
}

```