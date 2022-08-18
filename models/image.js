const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            }
        ],
        album: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "albums",
        },
        imgURL: String,
        size: Number,
        height: Number,
        width: Number,
    },
    { timestamps: true }
);

const Image = mongoose.model("images", ImageSchema);
module.exports = Image;
