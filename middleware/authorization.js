const { Todo } = require("../models")
const  { customError }  = require("../helpers/customError.js")

function authorization(req, res, next) {

    console.log(">>AUTHORIZATION<< \n");
    console.log(req.params)
    let TodoId = +req.params.id
    let userId = req.decoded.id
    Todo.findByPk(TodoId)
        .then(response => {
            console.log("Todo FOUND");
            console.log(response);
            if(response) {
                if(response.UserId === userId) {
                    console.log("AUTHORIZATION SUCCESS");
                    next()
                } else {
                    throw new customError(401, "UNAUTHORIZED ACCESS")
                }
            } else {
                throw new customError(404, "ENTRY NOT FOUND")
            }
        })
        .catch(err => {
            console.log(err)
            next(err)
        })
}

module.exports = { authorization }