import fs from "fs-extra"
import path from "path"
import mkdirp from "mkdirp"
import lodash from "lodash"
import * as stringFuncs from "./string"

interface TemplateObj {
    [key: string]: string
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined
}

function filesInDirectory(dir: string, recursive = true, acc: string[] = []) {
    try {
        const files = fs.readdirSync(dir)
        for (const i in files) {
            const name = [dir, files[i]].join(path.sep)
            if (fs.statSync(name).isDirectory()) {
                if (recursive) {
                    filesInDirectory(name, recursive, acc)
                }
            } else {
                acc.push(name)
            }
        }
        return acc
    } catch (e) {
        return acc
    }
}

function dirsInDirectory(dir: string, recursive = true, acc: string[] = []) {
    try {
        const dirs = fs.readdirSync(dir)
        for (const i in dirs) {
            const name = [dir, dirs[i]].join(path.sep)
            if (fs.statSync(name).isDirectory()) {
                acc.push(name)
                if (recursive) {
                    dirsInDirectory(name, true, acc)
                }
            }
        }
        return acc
    } catch (e) {
        return acc
    }
}

function writeFile(params: { srcFile?: string; data?: string; dest: string }) {
    try {
        const { srcFile, data, dest } = params
        const raw = srcFile ? fs.readFileSync(srcFile) : data
        const output = typeof raw === "string" ? raw : JSON.stringify(raw, null, 4)
        mkdirp.sync(path.dirname(dest))
        fs.writeFileSync(dest, output)
    } catch (e) {
        throw e
    }
}

function createDir(dir: string) {
    mkdirp.sync(dir)
}

function copyDir(srcDir: string, destDir: string, keepExisingInDest = false) {
    return fs.copySync(srcDir, destDir)
}

function copyFile(src: string, dest: string) {
    return fs.copySync(src, dest)
}

function removeDir(dir: string) {
    if (!fs.existsSync(dir)) {
        return
    }

    try {
        fs.readdirSync(dir).forEach(file => {
            const curPath = [dir, file].join(path.sep)
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                removeDir(curPath)
            } else {
                // delete file
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(dir)
    } catch (e) {
        throw e
    }
}

function removeFile(location: string) {
    if (!fs.existsSync(location)) {
        return
    }

    if (fs.lstatSync(location).isFile()) {
        fs.unlinkSync(location)
    } else {
        throw new Error(`${location} is not a file`)
    }
}

function readFile(filePath: string) {
    return fs.readFileSync(filePath, "utf8")
}

function getFileOrFolderName(location: string) {
    const arr = location.split(path.sep)
    const last = lodash.last(arr)
    if (!last) {
        return ""
    }

    return lodash.first(lodash.compact(last.split(".")).filter(notEmpty))
}

function getTemplate(templatePath: string, withParams: TemplateObj) {
    let file = readFile(templatePath)

    if (withParams) {
        lodash.each(withParams, (replacement, k) => {
            const find = `%${k}%`
            file = stringFuncs.replace(file, find, replacement)
            file = stringFuncs.replace(file, find.toLowerCase(), replacement)
            file = stringFuncs.replace(file, find.toUpperCase(), replacement)
        })
    }

    return file
}

function dirExists(dir: string) {
    try {
        return fs.statSync(dir).isDirectory()
    } catch (e) {
        return false
    }
}

function fileExists(file: string) {
    try {
        return fs.statSync(file).isFile()
    } catch (e) {
        return false
    }
}

export {
    filesInDirectory,
    dirsInDirectory,
    dirExists,
    fileExists,
    writeFile,
    copyDir,
    copyFile,
    removeDir,
    createDir,
    removeFile,
    readFile,
    getFileOrFolderName,
    getTemplate
}
