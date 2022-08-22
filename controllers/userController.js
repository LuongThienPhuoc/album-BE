const User = require("../models/users");
const Album = require("../models/album");
const Image = require("../models/image")
const OTP = require("../models/otp");
const bcrypt = require("bcrypt");
const MakeCode = require("../helper/MakeCode.js");
const SendMail = require('../helper/SendMail');
const fs = require('fs');
const path = require('path');
const Resize = require('../helper/Resize')
const saltRounds = 10;
const { JWTAuthToken } = require('../middleware/JWT')

class userController {

  getToken = async (req, res) => {
    const { email } = res.locals.data
    try {
      res.status(200).send(JSON.stringify({
        token: JWTAuthToken({ email })
      }))
    } catch (err) {
      res.status(401).send(JSON.stringify({
        err: err.message
      }))
    }

  }

  search = async (req, res) => {
    const user = await User.find({
      "email": {
        $regex: req.query.email,
      }
    }).select("email")
    res.status(200).json({
      message: "Tìm thành công",
      user
    })
  }

  test = async (req, res) => {
    const hashUrl = req.url.split("/")
    res.sendFile(hashUrl[6], {
      root: `./image/users/${hashUrl[3]}/${decodeURI(hashUrl[4])}/${hashUrl[5]}`,
    });
    // res.status(200).send(JSON.stringify({ message: 'hello' }))
  }

  isOwner = async (req, res) => {
    const { email } = res.locals.data
    let imgURL
    if (!req.isImage) {
      imgURL = `/image/users/${req.hashUrl[3]}/${decodeURI(req.hashUrl[4])}/${req.hashUrl[5]}.png`
    } else {
      imgURL = `/image/users/${req.hashUrl[3]}/${decodeURI(req.hashUrl[4])}/${req.hashUrl[5]}`
    }
    const image = await Image.findOne({ imgURL: imgURL })
      .populate("users", "email")
    const album = await Album.findOne({ _id: image.album })
      .populate("users", "email")
    const isCheckImage = image.users.some(user => user.email === email)
    const isCheckAlbum = album.users.some(user => user.email === email)
    if (isCheckAlbum || isCheckImage) {
      res.sendFile(req.hashUrl[5], {
        root: `./image/users/${req.hashUrl[3]}/${decodeURI(req.hashUrl[4])}/`,
      });
    } else {
      res.sendFile('404.jpg', {
        root: `./public/images`,
      });
    }
  }

  checkExistFile = async (req, res, next) => {
    const hashUrl = req.url.split("/")
    req.hashUrl = hashUrl
    if (hashUrl[5].includes(".png")) {
      req.isImage = true
    } else {
      req.isImage = false
    }
    if (fs.existsSync(`./image/users/${hashUrl[3]}/${decodeURI(hashUrl[4])}/${hashUrl[5]}`)) {
      next()
    } else {
      res.sendFile('404.jpg', {
        root: `./public/images`,
      });
    }
  }

  getImageOpenSeadragon = async (req, res) => {
    const { email } = res.locals.data
    const hashUrl = req.url.split("/")
    if (fs.existsSync(`./image/users/${hashUrl[3]}/${decodeURI(hashUrl[4])}/${hashUrl[5]}`)) {
      let imgURL = `/image/users/${hashUrl[3]}/${decodeURI(hashUrl[4])}/${hashUrl[5]}.png`
      const image = await Image.findOne({ imgURL: imgURL })
        .populate("users", "email")
      const album = await Album.findOne({ _id: image.album })
        .populate("users", "email")
      const isCheckImage = image.users.some(user => user.email === email)
      const isCheckAlbum = album.users.some(user => user.email === email)
      if (isCheckImage || isCheckAlbum) {
        res.sendFile(`/${hashUrl[7]}/${hashUrl[8]}`, {
          root: `./image/users/${hashUrl[3]}/${decodeURI(hashUrl[4])}/${hashUrl[5]}/${hashUrl[6]}`,
        });
      } else {
        res.sendFile('404.jpg', {
          root: `./public/images`,
        });
      }
    } else {
      res.sendFile('404.jpg', {
        root: `./public/images`,
      });
    }
  }

  refresh = async (req, res) => {
    const { email } = res.locals.data
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
    if (user) {
      res.status(200).send(JSON.stringify({
        message: "Refresh thành công",
        status: 1,
        user,

      }))
    } else {
      res.status(401).send(
        JSON.stringify({
          message: "Lỗi hệ thống",
        })
      );
    }
  }

  updateOtp = async (email, otp, isMailOtp, res) => {
    isMailOtp.otp = otp;
    isMailOtp.updateOtp = new Date()
    isMailOtp.save()
      .then(
        result => {
          SendMail(otp, email)
          res.status(200).send(
            JSON.stringify({
              message: "OTP được gửi về mail",
              status: 1,
              otp
            })
          );
        }
      )
      .catch(err => {
        res.status(200).send(
          JSON.stringify({
            message: "Lỗi hệ thống",
            status: -1,
            err: err.message,
          })
        );
      })
  }

  createOtp = async (email, otp, res) => {
    OTP.create({
      email,
      otp,
      updateOtp: new Date()
    }).then((result) => {
      if (result) {
        SendMail(otp, email)
        res.status(200).send(
          JSON.stringify({
            message: "OTP được gửi về mail",
            status: 1,
            result,
          })
        );
      }
    })
      .catch((err) => {
        res.status(200).send(
          JSON.stringify({
            message: "Lỗi hệ thống",
            status: -1,
            err,
          })
        );
      });
  }

  sendOtp = async (req, res) => {
    const { email } = req.body;
    const otp = MakeCode(6);
    const isMailOtp = await OTP.findOne({ email }).exec();
    if (isMailOtp) {
      this.updateOtp(email, otp, isMailOtp, res)
    } else {
      this.createOtp(email, otp, res)
    }
  }

  sendTotp = async (req, res) => {
    const { email } = req.body
    let token = MakeCode(6)
    SendMail(token, email)
    req.user.totp = bcrypt.hashSync(token, saltRounds)
    req.user.updateTotp = new Date()
    req.user.save()
      .then(
        result => {
          res.status(200).send(
            JSON.stringify({
              message: "TOTP được gửi về mail",
              status: 1,
              token
            })
          );
        }
      ).catch(err => {
        res.status(200).send(
          JSON.stringify({
            message: "Lỗi hệ thống",
            status: -1,
            err,
          })
        );
      })
  }

  isCheckExistUser = async (req, res, next) => {
    const { email, pass, totp } = req.body;
    const user = await User.findOne({ email }).exec()
    if (user) {
      req.user = user
      next()
    } else {
      res.status(200).send(
        JSON.stringify({
          message: "Email không tồn tại",
          status: -1,
        })
      );
    }
  }

  comparePass = async (req, res, next) => {
    const { pass, totp } = req.body;
    if (bcrypt.compareSync(pass + req.user.salt, req.user.pass)) {
      next()
    } else {
      res.status(200).send(
        JSON.stringify({
          message: "Sai mật khẩu",
          status: -1,
        })
      );
    }
  }

  verifyTotp = async (req, res) => {
    const { email, pass, totp } = req.body;
    let nowTime = new Date();
    if (bcrypt.compareSync(totp, req.user.totp) && nowTime - req.user.updateTotp <= 60000) {
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

      res.status(200).send(
        JSON.stringify({
          user,
          message: "Đăng nhập thành công",
          status: 1,
          token: JWTAuthToken({ email })
        })
      );
    } else {
      res.status(200).send(
        JSON.stringify({
          message: "TOTP hết hạn hoặc không tồn tại",
        })
      );
    }
  }


  checkSendTotp = async (req, res, next) => {
    const { email, pass, otp } = req.body;
    const isMailOtp = await OTP.findOne({ email }).exec();
    req.isMailOtp = isMailOtp
    if (!isMailOtp) {
      res.status(200).send(
        JSON.stringify({
          message: "Vui lòng nhấn gửi để nhận OTP",
          status: -1,
        })
      );
    } else {
      next()
    }
  }

  checkMailRegister = async (req, res, next) => {
    const { email } = req.body;
    const isEmail = await User.findOne({ email }).exec();
    req.isEmail = isEmail
    if (isEmail) {
      res.status(200).send(
        JSON.stringify({
          message: "Email tồn tại",
          status: -1,
        })
      );
    } else {
      next()
    }
  }

  checkTotpRegister = async (req, res, next) => {
    const { email, pass, otp } = req.body;
    let nowTime = new Date()
    if (otp === req.isMailOtp.otp && nowTime - req.isMailOtp.updateOtp <= 60000) {
      next()
    } else {
      res.status(200).send(
        JSON.stringify({
          message: "TOTP hết hạn hoặc không tồn tại",
        })
      );
    }
  }

  createFolderForUser = async (dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  createUser = async (req, res) => {
    const { email, pass } = req.body;
    let salt = MakeCode(20);
    User.create({
      email,
      pass: bcrypt.hashSync(pass + salt, saltRounds),
      salt
    })
      .then((result) => {
        if (result) {
          let dir = `./image/users/${email}`;
          this.createFolderForUser(dir)
          res.status(200).send(
            JSON.stringify({
              message: "Đăng ký thành công",
              status: 1,
              result,
            })
          );
        }
      })
      .catch((err) => {
        res.status(200).send(
          JSON.stringify({
            message: "Lỗi hệ thống",
            status: -1,
            err: err.message,
          })
        );
      });
  }

  resgister = async (req, res) => {
    const { email, pass, otp } = req.body;
    const isEmail = await User.findOne({ email }).exec();
    const isMailOtp = await OTP.findOne({ email }).exec();
    if (!isMailOtp) {
      res.status(200).send(
        JSON.stringify({
          message: "Vui lòng nhấn gửi để nhận OTP",
          status: -1,
        })
      );
    } else if (isEmail) {
      res.status(200).send(
        JSON.stringify({
          message: "Email tồn tại",
          status: -1,
        })
      );
    } else {
      let nowTime = new Date()
      if (otp === isMailOtp.otp && nowTime - isMailOtp.updateOtp <= 60000) {
        let salt = MakeCode(20);
        User.create({
          email,
          pass: bcrypt.hashSync(pass + salt, saltRounds),
          salt
        })
          .then((result) => {
            if (result) {
              let dir = `./image/users/${email}`;
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              res.status(200).send(
                JSON.stringify({
                  message: "Đăng ký thành công",
                  status: 1,
                  result,
                })
              );
            }
          })
          .catch((err) => {
            res.status(200).send(
              JSON.stringify({
                message: "Lỗi hệ thống",
                status: -1,
                err,
              })
            );
          });
      } else {
        res.status(200).send(
          JSON.stringify({
            message: "TOTP hết hạn hoặc không tồn tại",
          })
        );
      }

    }
  };

}

module.exports = new userController();
