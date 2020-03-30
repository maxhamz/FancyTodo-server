const { verifyToken } = require("../helpers/jwt.js")
const { customError } = require("../helpers/customError.js")
const { User } = require("../models")
let token
let payload
function authentication(req, res, next) {
    console.log(">>> AUTHENTICATION <<<");
    try {
        // console.log("WHAT IS REQ");
        // console.log(req);
        // console.log("what is req headers? \n");
        // console.log(req.headers);
        token = req.headers.access_token
        console.log("token is");
        console.log(token);
        payload = verifyToken(token)
        console.log(`the decrypted payload is`);
        console.log(payload);
        req.decoded = payload
        // next()

        User.findAll({
            where: {
                id: payload.id
            }
        })
        .then(response => {
            console.log(`USER FOUND`);
            // console.log(response);
            // console.log(`RESPONSE ID:`);
            // console.log(response[0].id);
            if(response[0].id === payload.id) {
                console.log(`AUTHENTICATION PASSED!`)
                req.decoded = payload
                next()
            } else {
                console.log("AUTHENTICATION FAILED!");
                throw new customError(401, "UNAUTHORIZED ACCESS")
            }
        })
    }
    catch(err) {
        console.log("ERROR AUTHENTICATING");
        // console.log(err);
        next(err)
    }
}

module.exports = { authentication }