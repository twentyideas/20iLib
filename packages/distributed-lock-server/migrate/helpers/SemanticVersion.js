/* eslint-disable @typescript-eslint/no-var-requires */
const packageJson = require("../../package.json")

module.exports = function SemanticVersion(v) {
    if (!v) {
        v = packageJson.version
    }

    const [majorStr, minorStr, patchStr] = v.split(".")
    this.major = parseInt(majorStr, 10)
    this.minor = parseInt(minorStr, 10)
    this.patch = parseInt(patchStr, 10)

    this.isEqualTo = other => {
        const { major, minor, patch } = this
        const o = other instanceof SemanticVersion ? other : new SemanticVersion(other)
        // console.log(major, minor, patch, o)
        return major === o.major && minor === o.minor && patch === o.patch
    }

    this.isLessThan = other => {
        const { major, minor, patch } = this
        const o = other instanceof SemanticVersion ? other : new SemanticVersion(other)

        if (major > o.major) return false
        if (major < o.major) return true

        if (minor > o.minor) return false
        if (minor < o.minor) return true

        return patch < o.patch
    }

    this.isLessThanOrEqualTo = other => this.isEqualTo(other) || this.isLessThan(other)
    this.isGreaterThan = other => !this.isEqualTo(other) && !this.isLessThan(other)
    this.isGreaterThanOrEqualTo = other => this.isEqualTo(other) || this.isGreaterThan(other)
    this.toString = () => [this.major, this.minor, this.patch].join(".")
}
