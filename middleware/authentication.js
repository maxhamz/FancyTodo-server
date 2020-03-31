const { verifyToken } = require("../helpers/jwt.js")
const { customError } = require("../helpers/customError.js")
const { User } = require("../models")

function authentication(req, res, next) {
    try {
        
        let token = req.headers.access_token
        let payload = verifyToken(token)

        User.findAll({
            where: {
                id: payload.id
            }
        })
        .then(response => {
            if(response[0].id === payload.id) {
                req.decoded = payload
                next()
            } else {
                throw new customError(401, "UNAUTHORIZED ACCESS")
            }
        })
    }
    catch(err) {
        next(err)
    }
}

module.exports = { authentication }