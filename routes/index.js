const router = require('express').Router()
const userRoute = require("../routes/user")
const projectRoute = require('../routes/project')

router.use("/users", userRoute)
router.use('/projects', projectRoute)
module.exports = router