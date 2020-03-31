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

class UserController {

    static register(req, res, next) {
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

        let userid
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

                let payload = {
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
        console.log(`>>> GOOGLE LOGIN <<<`);
        console.log("CREDENTIALS:");
        accessToken = req.headers.token
        console.log(accessToken, '<---- ACCESS TOKEN END ');
        googleClient.verifyIdToken({
                idToken: accessToken,
                audience: process.env.GOOGLE_CLIENT_ID
            })
            .then(ticket => {
                console.log(`TICKET FOUND!`);
                console.log(ticket);
                payload = ticket.getPayload();
                let userId = payload['sub']
                emailAddress = payload.email

                console.log(`TICKET PAYLOAD:`);
                console.log(payload);

                return User.findAll({
                    where: {
                        email: emailAddress
                    }
                })


            })
            .then(result1 => {
                console.log("RESULT 1 PAYLOAD");
                console.log(result1);
                if (result1.length === 0) {

                    return User.create({
                        email: emailAddress,
                        password: process.env.GOOGLE_DEFAULT_PASSWORD //leviathan
                    })
                } else {
                    return result1[0]
                }
            })
            .then(result2 => {
                payload = {
                    id: result2.id,
                    email: result2.email,
                }
                console.log(`RESULT 2 PAYLOAD:`);
                console.log(payload);

                // accessToken = createToken(payload)
                // console.log(`after result2, accessToken is`);
                // console.log(accessToken);
                // req.headers.token = accessToken
                res.status(200).json({
                    token: createToken(payload)
                })
            })
            .catch(err => {
                console.log("ERROR IN GOOGLE AUTH");
                console.log(err);
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