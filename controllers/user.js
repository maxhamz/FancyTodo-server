// const sequelize = require("sequelize")
const {
    User
} = require("../models")
const {
    checkPassword
} = require("../helpers/bcrypt.js")
const {
    createToken
} = require("../helpers/jwt.js")
const {
    customError
} = require("../helpers/customError.js")
const {
    OAuth2Client
} = require('google-auth-library')
const {
    getLocation
} = require('../helpers/getLocation')
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 3RD PARTY API REQUIREMENT: FREEGEOIP, DETECT LOCATION BY IP
let emailAddress
let passcode
let accessToken
let latlon
let payload

class UserController {

    static register(req, res, next) {

        console.log(">>> REGISTER FROM SERVER");
        console.log("REQ BODY IS");
        console.log(req.body);

        User.findOne({
                where: {
                    email: req.body.email
                }
            })
            .then(response => {
                if (response) {
                    throw new customError(400, 'EMAIL IS TAKEN')
                } else {
                    return getLocation()
                }
            })
            .then(response => {

                latlon = String(response.lat) + ";" + String(response.lon)
                return User.create({
                    email: req.body.email,
                    password: req.body.password,
                    location: latlon
                })
            })
            .then(response => {
                res.status(201).json({
                    data: response
                })
            })
            .catch(err => {
                next(err)
            })
    }


    static login(req, res, next) {

        console.log(">>> LOGIN FROM SERVER");
        console.log("REQ BODY IS");
        console.log(req.body);

        let userid

        // blame 
        emailAddress = req.body.email
        passcode = req.body.password

        User.findOne({
                where: {
                    email: emailAddress
                }
            })
            .then(response => {

                if (response) {
                    userid =  response.id
                    let passwordMatchFlag = checkPassword(passcode, response.password)

                    if (passwordMatchFlag) {

                        return getLocation()

                    } else {
                        throw new customError(400, "WRONG PASSWORD/EMAIL")
                    }
                } else {
                    throw new customError(400, "WRONG PASSWORD/EMAIL")
                }
            })
            .then(response => {

                latlon = String(response.lat) + ";" + String(response.lon)

                payload = {
                    id: userid,
                    email: emailAddress,
                    location: latlon
                }

                accessToken = createToken(payload)

                res.status(200).json({access_token: accessToken})

            })
            .catch(err => {
                next(err)
            })
    }

    static googleLogin(req, res, next) {

        accessToken = req.headers.access_token

        // GET LOCATION DATA FIRST
        return getLocation()
            .then(response => {

                latlon = String(response.lat) + ";" + String(response.lon)

                return googleClient.verifyIdToken({
                    idToken: accessToken,
                    audience: process.env.GOOGLE_CLIENT_ID
                })

            })
            .then(ticket => {
    
                payload = ticket.getPayload();

                // // let userId = payload['sub']
                emailAddress = payload['email']

                return User.findOne({
                    where: {
                        email: emailAddress
                    }
                })


            })
            .then(response => {
                if (response) {
                    return response
                } else {
                    return User.create({
                        email: emailAddress,
                        password: process.env.DEFAULT_SECRET,
                        location: latlon
                    })
                }
            })
            .then(response => {

                payload = {
                    id: response.id,
                    email: response.email,
                    location: response.location
                }

                accessToken = createToken(payload)

                res.status(200).json({
                    access_token: accessToken
                })
            })
            .catch(err => {
                next(err)
            })
    }

    static fetchAll(req, res, next) {
        console.log(">>> CONTROLLERS/USER: SHOW ALL USERS");
        User.findAll({
                attributes: {
                    exclude: ['password']
                }
            })
            .then(result => {
                console.log("SUCCESS FETCHING ALL USERS");
                res.status(200).json({
                    data: result
                })
            })
            .catch(err => {
                console.log("ERROR FETCHING ALL USERS");
                next(err)
            })
    }

}

module.exports = UserController