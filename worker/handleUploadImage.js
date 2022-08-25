const connectDB = require("../configDb")
const Image = require("../models/image")
const Album = require("../models/album")
const User = require("../models/users")
const tile = require("../helper/ToZip")
const fs = require('fs');
const fsExtra = require("fs-extra")
const handleChange = async () => {
    try {
        await connectDB()
        console.log("Change---------------------------")
        const image = Image.watch()
        image.on("change", async (change) => {
            console.log("----Image Change")
            if (change.operationType === "insert") {
                const isCheck = await tile("." + change.fullDocument.imgURL, __dirname.slice(0, __dirname.lastIndexOf("\\")) + change.fullDocument.imgURL)
                await Image.findOneAndUpdate({ _id: change.fullDocument._id }, { initImage: isCheck ? "1" : "-1" })
            }
        })
        const albums = Album.watch()
        albums.on("change", async (change) => {
            console.log("----Album Change")
            console.log(change)
            if (change.operationType === "update" && change.updateDescription.updatedFields?.oldName !== "" && change.updateDescription.updatedFields?.oldName) {
                const album = await Album.findOne({ name: change.updateDescription.updatedFields.name }).populate("users", "email")
                console.log(album)
                const oldPath = `./image/users/${album.users[0].email}/${album.oldName}`
                const newPath = `./image/users/${album.users[0].email}/${album.name}`
                console.log(fs.existsSync(oldPath))
                console.log(oldPath)
                if (fs.existsSync(oldPath)) {
                    fsExtra.copySync(oldPath, newPath)
                    fs.rmdirSync(oldPath, { recursive: true });
                }
                await album.save()
            }
        })


    } catch (err) {
        console.log(err.message);
    }
}

handleChange()


