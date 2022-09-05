const User = require("../models/users");
const Album = require("../models/album");
const Image = require("../models/image")
const fs = require('fs');
const path = require('path');
const Resize = require('../helper/Resize')
const Resize1 = require('../helper/Resize1')
const unzipper = require("unzipper")
const extract = require('extract-zip')
const sizeOf = require('buffer-image-size');
const MakeCode = require("../helper/MakeCode");
global.checkUpload = {}
const fsExtra = require("fs-extra")

class imageController {

    moveImage = async (req, res) => {
        try {
            const { nameAlbum, idImage } = req.body
            const image = await Image.findOne({ _id: idImage }).exec()
            const hash = image.imgURL.split("/")
            const oldPath = `.${image.imgURL}`
            hash[4] = nameAlbum
            image.imgURL = hash.join("/")
            const newPath = `.${hash.join("/")}`
            if (fs.existsSync(oldPath)) {
                fsExtra.copySync(oldPath, newPath)
                fsExtra.copySync(oldPath.slice(0, oldPath.lastIndexOf(".jpeg")), newPath.slice(0, newPath.lastIndexOf(".jpeg")))
                fs.rmSync(oldPath, { recursive: true });
                fs.rmdirSync(oldPath.slice(0, oldPath.lastIndexOf(".jpeg")), { recursive: true });
            }
            await Album.findOneAndUpdate(
                { _id: image.album },
                { $pull: { images: idImage } }
            )
            const album = await Album.findOneAndUpdate(
                {
                    name: nameAlbum,
                },
                {
                    $push: { images: idImage }
                }
            )
            image.album = album._id
            await image.save()
            res.status(200).json({
                message: "Success",
                status: 1
            })
        } catch (err) {
            res.status(400).json({
                err: err.message
            })
        }
    }

    clearTrash = async (req, res) => {
        try {
            Image.deleteMany({ initImage: "-1" })
                .then(result => {
                    res.status(200).json({
                        result
                    })
                })
        } catch (err) {
            res.status(400).json({
                err: err.message
            })
        }
    }

    deleteImage = async (req, res) => {
        try {
            const { email, idImage } = req.query
            const image = await Image.findOne({ _id: idImage }).exec();
            // Xóa foloder ở backedn
            if (fs.existsSync("." + image.imgURL)) await fs.rmSync("." + image.imgURL)
            if (fs.existsSync("." + image.imgURL.slice(0, image.imgURL.indexOf(".jpeg")))) await fs.rmdirSync("." + image.imgURL.slice(0, image.imgURL.indexOf(".jpeg")), { recursive: true })

            // Xóa image khỏi album
            await Album.findByIdAndUpdate(
                image.album,
                {
                    $pull: { images: image._id }
                }
            )
            // Xóa image khỏi albumsahre của các người dùng
            if (image.users.length > 1) {
                for (let i = 1; i < image.users.length; i++) {
                    await User.findByIdAndUpdate(
                        image.users[i],
                        {
                            $pull: { imagesShare: image._id }
                        }
                    )
                }
            }
            // xóa image
            await image.remove()
            res.writeContinue()
            res.status(200).json({
                message: "Thành công",
                idImage: image._id,
                status: 1
            })

        } catch (err) {
            res.status(400).json({
                err: err.message
            })
        }

    }
    unshareImageWithMe = async (req, res) => {
        const { idImage } = req.body;
        const { email } = res.locals.data
        try {
            const user = await User.findOneAndUpdate(
                {
                    email
                },
                {
                    $pull: { imagesShare: idImage }
                }
            )
            await Album.findOneAndUpdate(
                {
                    _id: idImage
                },
                {
                    $pull: { users: user._id }
                }
            )
            res.status(200).json({ message: "success", status: 1 })
        } catch (e) {
            res.status(400).json({
                message: e.message,
                status: 0
            })
        }
    }

    shareImage = async (req, res) => {
        try {
            const { listUser, idImage } = req.body
            const image = await Image.findOne({ _id: idImage }).populate("users", "email");
            for (let i = 0; i < listUser.length; i++) {
                if (!image.users.some(user => user.email === listUser[i])) {
                    const user = await User.findOneAndUpdate(
                        {
                            email: listUser[i],
                        },
                        {
                            $push: { imagesShare: idImage }
                        }
                    )
                    image.users.push(user._id)
                }
            }
            await image.save()

            Image.findOne({ _id: idImage }).populate("users", "email").select("size name imgURL")
                .then(result => {
                    if (result) {
                        res.status(200).send(JSON.stringify({ image: result, status: 1 }))
                    }
                })
                .catch(err => {
                    res.status(400).send(JSON.stringify({ err: err.message }))
                })
        } catch (err) {
            res.status(400).json({ err: err.message })
        }
    }
    unshareImage = async (req, res) => {
        try {
            const { listUser, idImage } = req.body
            for (let i = 0; i < listUser.length; i++) {
                const user = await User.findOneAndUpdate(
                    {
                        email: listUser[i]
                    },
                    {
                        $pull: { imagesShare: (idImage) }
                    }
                )
                await Image.findOneAndUpdate(
                    {
                        _id: idImage
                    },
                    {
                        $pull: { users: user._id }
                    }
                )
                if (i === listUser.length - 1) {
                    const imageReturn = await Image.findOne({ _id: idImage }).populate("users", "email").select("size name imgURL")
                    res.status(200).json({
                        status: 1,
                        image: imageReturn
                    })
                }
            }
        } catch (err) {
            res.status(400).json({ err: err.message })
        }
    }
    getImage = async (req, res) => {
        const { email } = res.locals.data
        const { idImage } = req.query
        const image = await Image.findOne({ _id: idImage }).populate("users", "email").populate("album", "name")
        const album = await Album.findOne({ _id: image.album }).populate("users", "email")
        const isCheckImage = image.users.some(user => user.email === email)
        const isCheckAlbum = album.users.some(user => user.email === email)
        if (isCheckImage || isCheckAlbum) {
            res.status(200).send(({ image, status: 1 }))
        } else {
            res.status(400).send(({ status: 0 }))
        }
    }
    isCheckFolder = async (req, res, next) => {
        const { email, albumId } = req.body
        const album = await Album.findOne({ _id: albumId })
        req.album = album
        let dir = `./image/users/${email}/${album.name}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        next()
    }
    isValidateFile = async (req, res, next) => {
        if (!req.files) {
            res.status(401).json({ error: 'Please provide an image' });
        }
        next()
    }

    checkUpload1 = async (req, res) => {
        try {
            const { listImage } = req.body
            const images = await Image.find({ _id: { $in: listImage } }).select("initImage size").exec()
            res.status(200)
                .send(JSON.stringify({
                    images,
                    status: 1
                }))
        } catch (err) {
            res.status(400).send(JSON.stringify({
                err: err.message
            }))
        }
    }

    saveFile1 = async (req, res, next) => {
        const { nameImage, email } = req.body
        const imagePath = path.join(__dirname.slice(0, __dirname.lastIndexOf("\\")), `/image/users/${email}/${req.album.name}`);
        const fileUpload = new Resize1(imagePath);
        const listImage = []
        try {
            const user = await User.findOne({ email })
            for (let i = 0; i < req.files.length; i++) {
                let imgURL = await fileUpload.save(req.files[i].buffer)
                if (imgURL) {
                    let dimensions = sizeOf(req.files[i].buffer);
                    let imageCreate = await Image.create({
                        name: nameImage,
                        imgURL: `/image/users/${email}/${req.album.name}/${imgURL}`,
                        size: req.files[i].size,
                        users: [user],
                        album: req.album,
                        height: dimensions.height,
                        width: dimensions.width,
                    })
                    await imageCreate.save()
                    listImage.push(imageCreate._id)

                    if (imageCreate) {
                        req.album.images.push(imageCreate)
                    }
                }

                if (req.files.length === i + 1) {
                    await req.album.save()
                    res.status(200).send(JSON.stringify({
                        message: "Success",
                        listImage,
                        status: 1
                    }))
                }
            }
        } catch (err) {
            res.status(400).json({
                status: 400,
                err: err.message
            })
        }

    }

    checkUpload = async (req, res) => {
        const { key, email } = req.body
        // res.status(200).send(JSON.stringify({
        //     checkUpload: global.checkUpload[key]
        // }))
        console.log(global.checkUpload)
        if (global.checkUpload[key][global.checkUpload[key].length - 1] !== 0) {
            const user = await User.findOne({ email }).populate({
                path: "albums albumsShare",
                populate: {
                    path: "images users",
                    select: "size email"
                }
            }).populate({
                path: "imagesShare",
                populate: {
                    path: "users",
                    select: "email"
                }
            }).exec()
            res.status(200).send(JSON.stringify({
                message: "Upload thành công",
                status: 1,
                user,
                checkUpload: global.checkUpload[key],
            }))
            delete global.checkUpload[key]
        } else {
            res.status(200).send(JSON.stringify({
                checkUpload: global.checkUpload[key],
                status: 1,
            }))
        }
    }

    saveFile = async (req, res, next) => {
        const { nameImage, email } = req.body
        const imagePath = path.join(__dirname.slice(0, __dirname.lastIndexOf("\\")), `/image/users/${email}/${req.album.name}`);
        const fileUpload = new Resize(imagePath);
        const user = await User.findOne({ email })
        const filename = []
        const key = MakeCode(6)
        let arr = new Array(req.files.length).fill(0)
        global.checkUpload[key] = arr
        res.status(200).send(JSON.stringify({
            key,
            status: 1
        }))
        for (let i = 0; i < req.files.length; i++) {
            let imgURL = await fileUpload.save(req.files[i].buffer, i, key)
            if (imgURL) {
                let dimensions = sizeOf(req.files[i].buffer);
                filename.push(imgURL)
                this.unzip(imgURL, imagePath)
                let imageCreate = await Image.create({
                    name: nameImage,
                    imgURL: `/image/users/${email}/${req.album.name}/${imgURL}`,
                    size: req.files[i].size,
                    users: [user],
                    album: req.album,
                    height: dimensions.height,
                    width: dimensions.width,
                })
                await imageCreate.save()
                if (imageCreate) {
                    req.album.images.push(imageCreate)
                }
            }

            if (req.files.length === i + 1) {
                await req.album.save()
            }
        }
    }
    async unzip(filename, imagePath) {
        const filezip = `${imagePath}\\${filename.split(".")[0] + ".zip"}`
        console.log(filezip)
        console.log(imagePath)
        try {
            extract(filezip, { dir: imagePath })
                .then(result => {
                    this.deleteZip(filename, imagePath)
                })
        } catch (err) {
            console.log(err.message)
        }
    }

    async deleteZip(filename, imagePath) {
        const filezip = `${imagePath}\\${filename.split(".")[0] + ".zip"}`
        if (fs.existsSync(filezip)) {
            fs.rmSync(filezip, { recursive: true })
        }
    }
}

module.exports = new imageController();
