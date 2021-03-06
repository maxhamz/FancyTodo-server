const { Project } = require("../models")
const  { customError }  = require("../helpers/customError.js")

function po_authorization(req, res, next) {
    console.log(">>> PO AUTHORIZATION");
    let projectId = +req.params.id
    let userId = req.decoded.id
    Project.findByPk(projectId)
        .then(response => {
            if(response) {
                console.log("PROJECT FOUND");
                console.log(response);
                if(response.UserId === userId) {
                    next()
                } else {
                    throw new customError(401, "UNAUTHORIZED ACCESS")
                }
            } else {
                throw new customError(404, "ENTRY NOT FOUND")
            }
        })
        .catch(err => {
            next(err)
        })
}

module.exports = { po_authorization }