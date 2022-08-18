const sharp = require('sharp');
const path = require('path');

class Resize {
    constructor(folder) {
        this.folder = folder;
    }


    async save(buffer, i, key) {
        const filename = Resize.filename();
        const filepath = this.filepath(filename);
        const filezip = this.filezip(filename)
        let isSucces = true
        await sharp(buffer)
            .png()
            .tile({
                size: 128,
                overlap: 2,
                layout: "dz"
            })
            .toFile(filezip)
            .then((res) => {
                console.log("create zip" + res);
            })
            .catch(err => {
                isSucces = false
                console.log("Cannot- zip")
                console.log(err.message)
            })

        await sharp(buffer)
            .resize(300, 300, {
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .png()
            .toFile(filepath).then(() => { console.log('Success') }).catch((err) => { console.log("err", err.message) })

        if (isSucces) {
            global.checkUpload[key][i] = true
            return filename
        } else {
            global.checkUpload[key][i] = false
            return false
        }
    }

    static filename() {
        return `${Date.now()}.png`;
    }

    filezip(filename) {
        return path.resolve(`${this.folder}/${filename.split(".")[0] + ".zip"}`)
    }

    filepath(filename) {
        return path.resolve(`${this.folder}/${filename}`)
    }
}
module.exports = Resize;