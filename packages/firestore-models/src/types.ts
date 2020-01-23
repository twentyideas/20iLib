import Firebase, { User as FbAuthUser } from "firebase"

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace FirestoreModels {
    export const NO_ID = ""
    export type FbQuery = [string | Firebase.firestore.FieldPath, Firebase.firestore.WhereFilterOp, any]
    
    export interface BaseRecord {
        id: string
        dateCreated: string
        dateUpdated: string
        userIdCreated: string
        userIdUpdated: string
    }

    export type BLANK_FN<T> = (partial?: Partial<T>) => T
    export type VALIDATION_FN<T> = (entity: T, currentUser: FbAuthUser | undefined) => void | Promise<void>
}
