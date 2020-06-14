import * as Exception from "@20i/exceptions"
import Firebase, { User as FbAuthUser } from "firebase"
import admin from "firebase-admin"
import { isFunction, pickBy } from "lodash"
import { IN, OUT } from "./transform"
import { FirestoreModels } from "./types"

export * from "./transform"
export * from "./types"

const isAdminApp = (app: Firebase.app.App | admin.app.App): app is admin.app.App => {
    const b = app as admin.app.App
    return isFunction(b.securityRules)
}

const isClientApp = (app: Firebase.app.App | admin.app.App): app is Firebase.app.App => {
    return !isAdminApp(app)
}

interface State {
    app: Firebase.app.App | admin.app.App | undefined
    now: undefined | (() => Date)
}

const state: State = {
    app: undefined,
    now: undefined
}

function firestore(): Firebase.firestore.Firestore {
    if (!state.app) {
        throw Exception.InternalError(`Called firestore before initializing app!`)
    }

    // casts admin firestore as client firestore!
    return state.app.firestore() as Firebase.firestore.Firestore
}

function now() {
    if (state.now) {
        return state.now()
    }
    return new Date()
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const defaultValidationFn = () => {}

// always call this first!!
export function init(app: Firebase.app.App | admin.app.App, nowFn?: () => Date) {
    state.app = app
    state.now = nowFn
}

export function baseRecord(): FirestoreModels.BaseRecord {
    const nowStr = now().toISOString()
    return {
        id: FirestoreModels.NO_ID,
        dateCreated: nowStr,
        dateUpdated: nowStr,
        userIdCreated: FirestoreModels.NO_ID,
        userIdUpdated: FirestoreModels.NO_ID
    }
}

export interface ValidationFns<T> {
    get: FirestoreModels.VALIDATION_FN<T>
    create: FirestoreModels.VALIDATION_FN<T>
    update: FirestoreModels.VALIDATION_FN<T>
    remove: FirestoreModels.VALIDATION_FN<T>
}

// generic helper class to interact with firebase
export class FirebaseModelFns<T extends FirestoreModels.BaseRecord> {
    private _blankFn: FirestoreModels.BLANK_FN<T>
    private _collectionName: string
    private _validationFns: ValidationFns<T>

    private _update = async (currentUser: FbAuthUser | undefined, partial: Partial<T>, createIfNonExistent: boolean): Promise<T> => {
        if (!partial.id) {
            throw Exception.BadRequest(`Cannot update ${this._collectionName} because no id was given!`)
        }

        const current = await this.get(currentUser, partial.id)
        if (!current && !createIfNonExistent) {
            throw Exception.NotFound(`${this._collectionName}: Cannot update entity with id ${partial.id} because it doesn't exist`)
        }

        const payload = pickBy(partial, (v, k) => !["userIdCreated", "dateCreated"].includes(k))
        const entityUpdated = this._blankFn({
            ...current,
            ...payload,
            dateUpdated: now().toISOString(),
            userIdUpdated: currentUser?.uid || FirestoreModels.NO_ID
        })

        await this._validationFns.update(entityUpdated, currentUser)
        await firestore()
            .collection(this._collectionName)
            .doc(partial.id)
            .set(OUT(entityUpdated))
        return entityUpdated
    }

    constructor(collectionName: string, blankFn: (partial?: Partial<T>) => T, validationFns?: Partial<ValidationFns<T>>) {
        this._collectionName = collectionName
        this._blankFn = blankFn
        this._validationFns = {
            ...validationFns,
            get: defaultValidationFn,
            create: defaultValidationFn,
            update: defaultValidationFn,
            remove: defaultValidationFn
        }
    }

    asUser = (currentUser: FbAuthUser | undefined) => {
        return {
            create: (partial: Partial<T>, overwriteExisting?: boolean) => this.create(currentUser, partial, overwriteExisting),
            get: (id: string, blankIfNonExistent?: boolean) => this.get(currentUser, id, blankIfNonExistent),
            exists: (id: string) => this.exists(currentUser, id),
            find: (query: FirestoreModels.FbQuery[]) => this.find(currentUser, query),
            findOne: (query: FirestoreModels.FbQuery[]) => this.findOne(currentUser, query),
            update: (partial: Partial<T>) => this.update(currentUser, partial),
            updateOrCreate: (partial: Partial<T>) => this.updateOrCreate(currentUser, partial),
            mergeUpdate: (partial: Partial<T>) => this.mergeUpdate(currentUser, partial),
            remove: (id: string) => this.remove(currentUser, id),
            querySubscribe: (query: FirestoreModels.FbQuery[], onValue: (val: T[]) => void) => this.querySubscribe(currentUser, query, onValue),
            subscribe: (id: string, onValue: (val: T | undefined) => void, blankIfNonExistent = false) => {
                return this.subscribe(currentUser, id, onValue, blankIfNonExistent)
            }
        }
    }

    asLoggedInUser = () => {
        if (!state.app) {
            throw Exception.InternalError(`Called firestore before initializing app!`)
        }

        if (!isClientApp(state.app)) {
            throw Exception.InternalError(`The firestore app is not a client app!`)
        }

        return this.asUser(state.app.auth().currentUser || undefined)
    }

    create = async (currentUser: FbAuthUser | undefined, partial: Partial<T>, overwriteExisting?: boolean): Promise<T> => {
        const nowStr = now().toISOString()
        const collection = firestore().collection(this._collectionName)
        if (partial.id) {
            const exists = await this.exists(currentUser, partial.id)
            if (exists && !overwriteExisting) {
                throw Exception.BadRequest(
                    `${this._collectionName}: Cannot create because id ${partial.id} already exists! Turn on overwriteExisting if you want to overwrite existing entity!`
                )
            }
        }

        const firestoreId = partial.id || collection.doc().id
        const userId = currentUser?.uid || FirestoreModels.NO_ID
        const entityNew = this._blankFn({
            ...partial,
            id: firestoreId,
            dateCreated: nowStr,
            dateUpdated: nowStr,
            userIdUpdated: userId,
            userIdCreated: userId
        })

        await this._validationFns.create(entityNew, currentUser)
        await collection.doc(firestoreId).set(OUT(entityNew))
        return entityNew
    }

    get = async (currentUser: FbAuthUser | undefined, id: string, blankIfNonExistent?: boolean): Promise<T | undefined> => {
        const collection = firestore().collection(this._collectionName)
        const result = await collection.doc(id).get()
        const data = result.data()
        if (data === undefined) {
            return blankIfNonExistent ? this._blankFn() : undefined
        }

        const entity = this._blankFn(IN(data) as Partial<T>)
        await this._validationFns.get(entity, currentUser)
        return entity
    }

    exists = async (currentUser: FbAuthUser | undefined, id: string): Promise<boolean> => {
        const r = await this.get(currentUser, id)
        return !!r
    }

    find = async (currentUser: FbAuthUser | undefined, query: FirestoreModels.FbQuery[]): Promise<T[]> => {
        let q: Firebase.firestore.Query = firestore().collection(this._collectionName)
        query.forEach(([prop, op, value]) => {
            q = q.where(prop, op, value)
        })

        const result = await q.get()
        if (!result.docs.length) {
            return []
        }

        let arr = result.docs.map(doc => this._blankFn(IN(doc.data()) as Partial<T>))
        const validationResult = await Promise.all(
            arr.map(async entity => {
                try {
                    await this._validationFns.get(entity, currentUser)
                    return true
                } catch (e) {
                    return false
                }
            })
        )

        arr = arr.filter((entity, idx) => validationResult[idx] === true)
        return arr
    }

    findOne = async (currentUser: FbAuthUser | undefined, query: FirestoreModels.FbQuery[]): Promise<T | undefined> => {
        const result = await this.find(currentUser, query)
        return result[0] || undefined
    }

    update = (currentUser: FbAuthUser | undefined, partial: Partial<T>): Promise<T> => this._update(currentUser, partial, false)
    updateOrCreate = (currentUser: FbAuthUser | undefined, partial: Partial<T>): Promise<T> => {
        // get a new id if none provided. We will create this record now.
        if (!partial.id) {
            partial.id = firestore()
                .collection(this._collectionName)
                .doc().id
        }

        return this._update(currentUser, partial, true)
    }

    mergeUpdate = async (currentUser: FbAuthUser | undefined, partial: Partial<T>): Promise<T> => {
        if (!partial.id) {
            throw Exception.BadRequest(`Cannot update ${this._collectionName} because no id was given!`)
        }

        const current = await this.get(currentUser, partial.id)
        if (!current) {
            throw Exception.NotFound(`${this._collectionName}: Cannot update entity with id ${partial.id} because it doesn't exist`)
        }

        const dateUpdated = now().toISOString()
        const userIdUpdated = currentUser?.uid || FirestoreModels.NO_ID

        const payload = pickBy(partial, (v, k) => !["userIdCreated", "dateCreated"].includes(k))
        const fullEntityOnUpdate = this._blankFn({
            ...current,
            ...payload,
            dateUpdated,
            userIdUpdated
        })

        const updatePayload: Partial<T> = {
            ...partial,
            dateUpdated,
            userIdUpdated
        }

        await this._validationFns.update(fullEntityOnUpdate, currentUser)
        await firestore()
            .collection(this._collectionName)
            .doc(partial.id)
            .set(OUT(updatePayload), { merge: true })
        return fullEntityOnUpdate
    }

    remove = async (currentUser: FbAuthUser | undefined, id: string): Promise<T> => {
        const entityRemoved = await this.get(currentUser, id)
        if (!entityRemoved) {
            throw Exception.NotFound(`${this._collectionName}: Cannot remove entity with id ${id} because it doesn't exist`)
        }

        await this._validationFns.remove(entityRemoved, currentUser)
        await firestore()
            .collection(this._collectionName)
            .doc(id)
            .delete()
        return entityRemoved
    }

    subscribe = (currentUser: FbAuthUser | undefined, id: string, onValue: (val: T | undefined) => void, blankIfNonExistent = false): (() => void) => {
        return firestore()
            .collection(this._collectionName)
            .doc(id)
            .onSnapshot(async snap => {
                const data = snap.data()
                const emptyData = blankIfNonExistent ? this._blankFn() : undefined
                if (data === undefined) {
                    return emptyData
                }

                const entity = this._blankFn(IN(data) as Partial<T>)
                try {
                    await this._validationFns.get(entity, currentUser)
                    return onValue(entity)
                } catch (e) {
                    return onValue(emptyData)
                }
            })
    }

    querySubscribe = (currentUser: FbAuthUser | undefined, query: FirestoreModels.FbQuery[], onValue: (val: T[]) => void): (() => void) => {
        let q: Firebase.firestore.Query = firestore().collection(this._collectionName)
        query.forEach(([prop, op, value]) => {
            q = q.where(prop, op, value)
        })

        return q.onSnapshot(async snap => {
            if (!snap.docs.length) {
                return onValue([])
            }
            let arr = snap.docs.map(doc => this._blankFn(IN(doc.data()) as Partial<T>))
            const validationResult = await Promise.all(
                arr.map(async entity => {
                    try {
                        await this._validationFns.get(entity, currentUser)
                        return true
                    } catch (e) {
                        return false
                    }
                })
            )
            arr = arr.filter((entity, idx) => validationResult[idx] === true)
            return onValue(arr)
        })
    }
}
