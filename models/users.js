const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
    },
    pass: {
      type: String,
    },
    totp: {
      type: String,
    },
    salt: {
      type: String
    },
    updateTotp: Date,
    albums: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "albums",
      }
    ],
    albumsShare: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "albums",
      }
    ],
    imagesShare: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "images",
      }
    ],
    avatarURL: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/1053/1053244.png?w=360"
    },
    name: {
      type: String,
      default: "NONAME"
    }
  },
  { timestamps: true }
);

const User = mongoose.model("users", UserSchema);
module.exports = User;
