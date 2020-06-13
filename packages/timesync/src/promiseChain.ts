type acceptableFn<T> = () => Promise<T>

export default function promiseChain<T>(promiseFns: acceptableFn<T>[]): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        let lastOutput: T | undefined = undefined
        async function chain(idx = 0) {
            const fn = promiseFns[idx]
            if (!fn) {
                return resolve(lastOutput)
            } else {
                try {
                    lastOutput = await fn()
                    chain(idx + 1)
                } catch (e) {
                    return reject({
                        chainIdx: idx,
                        error: e
                    })
                }
            }
        }
        chain()
    })
}
