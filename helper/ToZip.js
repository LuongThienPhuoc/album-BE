const sharp = require('sharp');
const extract = require('extract-zip')
const fs = require('fs');
const MakeCode = require("../helper/MakeCode")

const resize = async (imgURL) => {
    const temporaryName = MakeCode(9);
    const dir = imgURL.slice(0, imgURL.lastIndexOf("/"))
    const realName = imgURL.slice(imgURL.lastIndexOf("/"), imgURL.length)

    await sharp(imgURL)
        .resize(300, 300, {
            fit: sharp.fit.inside,
            withoutEnlargement: true
        })
        .jpeg()
        .toFile(dir + "/" + temporaryName)
        .then(() => {
            console.log('Success')
            if (fs.existsSync(imgURL)) fs.rmSync(imgURL)
            console.log(dir + "/" + temporaryName)
            console.log(dir + realName)
            if (fs.existsSync(dir + "/" + temporaryName)) fs.renameSync(dir + "/" + temporaryName, dir + realName)
        })
        .catch((err) => { console.log("err", err.message) })
}

const tile = async (imgURL, imagePath) => {
    // let filezip = imgURL.replace(".png", ".zip")
    let filezip = imgURL.replace(".jpeg", ".zip")
    let isCheck = true;
    await sharp(imgURL)
        // .png()
        .jpeg()
        .tile({
            size: 256,
            overlap: 2,
            layout: "dz"
        })
        .toFile(filezip)
        .then((res) => {
            console.log("create zip" + res);
            unzip(imagePath)
            resize(imgURL)
        })
        .catch(err => {
            if (fs.existsSync(imgURL)) fs.rmSync(imgURL)
            console.log("Cannot- zip")
            console.log(err.message)
            isCheck = false
        })
    return isCheck
}

const unzip = async (imagePath) => {
    // const filezip = imagePath.replace(".png", ".zip")
    const filezip = imagePath.replace(".jpeg", ".zip")
    const dir = filezip.slice(0, filezip.lastIndexOf("/"))
    console.log(dir)
    try {
        extract(filezip, { dir: dir })
            .then(result => {
                deleteZip(filezip, dir)
            })
    } catch (err) {
        console.log(err.message)
    }
}

const deleteZip = (filezip) => {
    if (fs.existsSync(filezip)) {
        console.log("filezip")
        fs.rmSync(filezip, { recursive: true })
        console.log("Delete success file zip")
    }
}

module.exports = tile;