const User = require("../models/users");
const Album = require("../models/album");
const Image = require("../models/image")
const fs = require('fs');
const { JWTAuthToken } = require('../middleware/JWT');
const { default: mongoose } = require("mongoose");

class albumController {
    getImagesInAlbum = async (req, res) => {
        Album.findOne({ _id: req.query.id })
            .populate({
                path: "images",
                select: "size name imgURL email users",
                populate: {
                    path: "users",
                    select: "email"
                }
            }).populate({
                path: "users",
                select: "email",
            })

            .then(result => {
                res.status(200).json({
                    message: "success",
                    status: 1,
                    album: result
                })
            })
            .catch(err => {
                res.status(400).json({ message: "faided", err: err.message })
            })
    }

    addAlbum = async (req, res) => {
        try {
            const { nameAlbum, email } = req.body
            let dir = `./image/users/${email}/${nameAlbum}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                const user = await User.findOne({ email }).exec()
                const newAlbum = await Album.create({
                    name: nameAlbum,
                    images: [],
                    users: [user._id],
                })
                user.albums.push(newAlbum._id)
                user.save()
                    .then(result => {
                        result.populate({
                            path: "albums albumsShare",
                            populate: {
                                path: "images users",
                                select: "size email"
                            }
                        }).then(resultPopulate => {
                            res.status(201).send(JSON.stringify({
                                message: "Tạo album mới thành công",
                                status: 0,
                                dataUser: resultPopulate
                            }))
                        })
                    })
            } else {
                res.status(400).send(JSON.stringify({
                    message: "Album tồn tại",
                    status: 0
                }))
            }
        } catch (err) {
            res.status(400).send(JSON.stringify({
                err: err.message,
                message: "Lỗi hệ thống",
                status: 0
            }))
        }
    }

    deleteAlbum = async (req, res) => {
        try {
            const { email, nameAlbum, _id } = req.body;
            //Xóa album
            Album.deleteOne({ _id })
                .then(result => {
                    //Xóa folder
                    let dir = `./image/users/${email}/${nameAlbum}`;
                    fs.rmdirSync(dir, { recursive: true })
                    if (result.deletedCount === 1) {
                        //Xóa album trong trong user
                        User.findOneAndUpdate(
                            { email },
                            { $pull: { albums: _id } },
                            (err, data) => {
                                if (err) {
                                    return res.status(500).json({ error: 'error in deleting address' });
                                } else {
                                    Image.deleteMany({ album: _id })
                                        .then(deleteMany => {
                                            data.populate({
                                                path: "albums albumsShare",
                                                populate: {
                                                    path: "images users",
                                                    select: "size email"
                                                }
                                            })
                                                .then(resultPopulate => {
                                                    res.status(201).send(JSON.stringify({
                                                        message: "Delete album thành công",
                                                        status: 1,
                                                        result,
                                                        data: resultPopulate,
                                                        deleteMany
                                                    }))
                                                })
                                        })
                                        .catch(err => {
                                            res.status(400).send(JSON.stringify({
                                                err: err.message,
                                                message: "Xóa album thất bại",
                                                status: 0
                                            }))
                                        })
                                }
                            }
                        )
                    }
                })
                .catch(err => {
                    res.status(400).send(JSON.stringify({
                        err: err.message,
                        message: "Xóa album thất bại",
                        status: 0
                    }))
                })
        } catch (err) {
            console.error(`Error while deleting ${dir}.`);
        }
    }

    shareAlbum = async (req, res) => {
        try {
            const { listUser, idAlbum } = req.body
            const album = await Album.findOne({ _id: idAlbum }).populate("users", "email");
            for (let i = 0; i < listUser.length; i++) {
                if (!album.users.some(user => user.email === listUser[i])) {
                    const user = await User.findOneAndUpdate(
                        {
                            email: listUser[i]
                        },
                        {
                            $push: { albumsShare: idAlbum }
                        }
                    )
                    album.users.push(user._id)
                }
            }
            await album.save()
                .then(result => {
                    if (result) {
                        result.populate("images users", "size name imgURL email").then(resultPopulate => {
                            res.status(200).send(JSON.stringify({ album: resultPopulate, status: 1 }))
                        })
                    }
                })
                .catch(err => {
                    res.status(400).send(JSON.stringify({ err: err.message }))
                })
        } catch (err) {
            res.status(400).json({ err: err.message })

        }

    }

    unshareAlbum = async (req, res) => {
        try {
            const { listUser, idAlbum } = req.body
            for (let i = 0; i < listUser.length; i++) {
                const user = await User.findOneAndUpdate(
                    {
                        email: listUser[i]
                    },
                    {
                        $pull: { albumsShare: (idAlbum) }
                    }
                )
                await Album.findOneAndUpdate(
                    {
                        _id: idAlbum
                    },
                    {
                        $pull: { users: user._id }
                    }
                )
                if (i === listUser.length - 1) {
                    const albumReturn = await Album.findOne({ _id: idAlbum }).populate("images users", "size name imgURL email")
                    res.status(200).json({
                        status: 1,
                        album: albumReturn
                    })
                }
            }
        } catch (err) {
            res.status(400).json({ err: err.message })
        }
    }

    unshareAlbumWithMe = async (req, res) => {
        const { idAlbum } = req.body
        const { email } = res.locals.data
        try {
            const user = await User.findOneAndUpdate(
                {
                    email
                },
                {
                    $pull: { albumsShare: idAlbum }
                }
            )
            await Album.findOneAndUpdate(
                {
                    _id: idAlbum
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
}

module.exports = new albumController();
