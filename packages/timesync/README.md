# @20i/timesync

This library provides a way to get synchronized Time with a time server (20i time server by default)

```javascript
import timesync from "@20i/timesync"

async function() {
    await timesync.sync({ delay: 50 })
    console.log("offsetMs", timesync.offsetMs)
    console.log("moment", timesync.now().toISOString())
}
```
