const fs = require('fs')
const path = require('path');

module.exports = function* getAllImages(dir) {
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