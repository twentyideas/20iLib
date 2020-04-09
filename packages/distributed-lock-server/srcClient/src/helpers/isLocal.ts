export function isLocal() {
    return ["localhost", "127.0.0.1"].includes(window.location.hostname) || window.location.hostname.startsWith("192")
}
