
# @20i/timesync
This library provides a way to get synchronized Time with a time server (20i time server by default)

```javascript
import timesync from "@20i/timesync"

async function() {
    await timesync.init()
    console.log(timesync.now().toISOString())
}
```