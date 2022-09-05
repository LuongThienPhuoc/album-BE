const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
class Resize {
    constructor(folder) {
        this.folder = folder;
    }

    async save(buffer) {
        const filename = Resize.filename();
        const filepath = this.filepath(filename);
        await sharp(buffer)
            // .png()
            .jpeg()
            .toFile(filepath).then(() => { console.log('Success ' + filename) }).catch((err) => { console.log("err", err.message) })
        return filename
    }

    static filename() {
        return `${uuidv4()}.jpeg`
    }

    filezip(filename) {
        return path.resolve(`${this.folder}/${filename.split(".")[0] + ".zip"}`)
    }

    filepath(filename) {
        return path.resolve(`${this.folder}/${filename}`)
    }
}

module.exports = Resize;