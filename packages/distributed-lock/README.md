
# @20i/distributed-lock
This library talks to our aws distributed lock servers and provides automatic locking/unlocking on functions


```javascript
import DistributedLock from "@20i/distributed-lock"

async function test() {
    const dl = new DistributedLock("your-project-api-key")
    const result = await dl.acquireLock({
        lockName: "my-lock",
        fn: async () => {
            await doSomeThinkingThatTakesAWhile()
            // during this time, if any other client wants to get 'my-lock', it will wait until this long fn is done
            return 10
        }
    })

    console.log(result) // 10
}
```

As soon as the function is done, the lock will be removed!

Be warned that locks have an expiration time of 10 seconds by default. However, if you expect that your function will take longer,
you can provide a custom expiration time!

```javascript
import DistributedLock from "@20i/distributed-lock"

async function test() {
    const dl = new DistributedLock("your-project-api-key")
    const result = await dl.acquireLock({
        lockName: "my-lock",
        expirationTimeMs: 20000,    // "my-lock" will now expire 20 seconds after it is created!
        fn: async () => {
            await doSomeThinkingThatTakesAWhile()
            // during this time, if any other client wants to get my-lock, it will wait until this long fn is done
            return 10
        }
    })

    console.log(result) // 10
}
```

You can also provide a timeout if you do not wish to wait past a certain amount of time.

```javascript
import DistributedLock from "@20i/distributed-lock"

async function test() {
    const dl = new DistributedLock("your-project-api-key")
    const result = await dl.acquireLock({
        lockName: "my-lock",
        timeout: 5000,  // if someone else is using "my-lock" and we end up waiting for than 5000 ms, we will stop trying!
        fn: async () => {
            await doSomeThinkingThatTakesAWhile()
            // during this time, if any other client wants to get my-lock, it will wait until this long fn is done
            return 10
        }
    })

    console.log(result) // 10
}
```