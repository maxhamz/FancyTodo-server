const userRoute = require('express').Router()
const UserController = require('../controllers/user')


userRoute.post('/register', UserController.register )
userRoute.post('/login', UserController.login)
// userRoute.post('/googlelogin', UserController.googleLogin)
userRoute.get('/fetchall', UserController.fetchAll )

module.exports = userRoute