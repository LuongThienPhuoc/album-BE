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
        initImage: {
            type: Number,
            default: 0,
            // 0: loading, -1: false, 1:true
        },

    },
    { timestamps: true }
);

const Image = mongoose.model("images", ImageSchema);
module.exports = Image;
