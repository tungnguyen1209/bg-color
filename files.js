const fs = require('fs')
const path = require('path');

function* getAllFiles(dir) {
    const directs = fs.readdirSync(dir, { withFileTypes: true })
    for (const direct of directs) {
        if (direct.name !== '.gitkeep') {
            const res = path.resolve(dir, direct.name)
            if (direct.isDirectory()) {
                yield* getAllImages(res)
            } else {
                yield res
            }
        }
    }
}

function removeAllFiles(dir) {
    const files = getAllFiles(dir);
    for (let file of files) {
        fs.unlinkSync(file);
    }
}

module.exports = { 'getAllFiles': getAllFiles, 'removeAllFiles': removeAllFiles }