const { send } = require('emailjs-com');
const jwt = require('jsonwebtoken')
const key = "thienphuoc"

function JWTAuthToken(data) {
    return (jwt.sign(
        { ...data },
        key,
        { expiresIn: '6000s' } // 10'
    ))
}

function JWTVerify(token) {
    try {
        var decoded = jwt.verify(token, key);
        return {
            status: 200,
            decoded
        }
    } catch (err) {
        return {
            status: 401,
            err
        }
    }
}

async function AuthMiddleware(req, res, next) {
    try {
        const token = req.cookies._jwtAlbum
        if (!token) {
            res.status(200).send(JSON.stringify({ status: 401 }))
        } else {
            jwt.verify(token, key, (err, data) => {
                if (err) {
                    res.status(200).send(JSON.stringify({
                        status: 401,
                        err: err.message
                    }))
                } else {
                    res.locals.data = data
                    next()
                }
            })
        }
    } catch (err) {
        res.status(401).send(JSON.stringify({
            status: 0,
            err: err.message
        }))
    }
}



module.exports = { JWTAuthToken, AuthMiddleware, JWTVerify };