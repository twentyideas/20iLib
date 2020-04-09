export function sanitizeUrl(url: string) {
    let prefix = ""
    if (url.startsWith("http://")) {
        url = url.replace("http://", "")
        prefix = "http://"
    } else if (url.startsWith("https://")) {
        url = url.replace("https://", "")
        prefix = "https://"
    }
    return [prefix, url.split("//").join("/")].join("")
}
