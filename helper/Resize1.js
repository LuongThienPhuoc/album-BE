const sharp = require('sharp');
const path = require('path');

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
            .toFile(filepath).then(() => { console.log('Success') }).catch((err) => { console.log("err", err.message) })
        return filename
    }

    static filename() {
        // return `${Date.now()}.png`;
        return `${Date.now()}.jpeg`;
    }

    filezip(filename) {
        return path.resolve(`${this.folder}/${filename.split(".")[0] + ".zip"}`)
    }

    filepath(filename) {
        return path.resolve(`${this.folder}/${filename}`)
    }
}
module.exports = Resize;