const nodemailer = require('nodemailer')
var QRCode = require('qrcode')
const SendMail = async (token, email) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'lngthinphc@gmail.com',
            pass: "ffzsbzapysrkivhw",
        }
    });

    QRCode.toDataURL(token, function (err, string) {
        if (err) throw err
        let mailOptions = {
            from: '"TOTP" <xx@gmail.com>', // sender address
            to: `${email}`, // list of receivers
            subject: "TOTP", // Subject line
            text: "QR - Code", // plain text body
            attachDataUrls: true,
            html: '<h1>Scan QR Code</h1> </br> <img src="' + string + '">'
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
            res.render('index');
        });
    })


}
module.exports = SendMail