const jwt = require("jsonwebtoken")

function createToken(payload) {
    let token = null
    console.log(">>> ENTERING CREATE-TOKEN <<<");
    console.log("HEADS UP! TOKEN IS");
    token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' })
    console.log(token);
    return token
}

function verifyToken(logged) {
    console.log(">>> ENTERING VERIFY-TOKEN <<<");
    console.log("HEADS UP! FLAG IS");
    let flag = jwt.verify(logged, process.env.SECRET)
    console.log(flag);
    return jwt.verify(logged, process.env.SECRET)
}

module.exports = {
    createToken, 
    verifyToken
}