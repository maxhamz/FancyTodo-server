const jwt = require("jsonwebtoken")

function createToken(payload) {
    return jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' })
}

function verifyToken(logged) {
    return jwt.verify(logged, process.env.SECRET)
}

module.exports = {
    createToken, 
    verifyToken
}