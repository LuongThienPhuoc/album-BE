const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AlbumSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        images: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "images",
            }
        ],
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            }
        ],
    },
    { timestamps: true }
);

const Album = mongoose.model("albums", AlbumSchema);
module.exports = Album;
