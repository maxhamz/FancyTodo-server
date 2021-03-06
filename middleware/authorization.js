const { ProjectUser } = require("../models")
const  { customError }  = require("../helpers/customError.js")

function authorization(req, res, next) {
    let projectId = +req.params.projectid
    let userId = req.decoded.id
    ProjectUser.findOne({
        where: {
            ProjectId: projectId,
            UserId: userId
        }
    })
        .then(response => {
            if(response) {
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

module.exports = { authorization }