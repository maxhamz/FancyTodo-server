// const sequelize = require("sequelize")
const { User } = require("../models")
const { checkPassword } = require("../helpers/bcrypt.js")
const { createToken } = require("../helpers/jwt.js")
const { customError } = require("../helpers/customError.js")
const { OAuth2Client } = require('google-auth-library')
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
let emailAddress
let userId
let payload
let passcode
let accessToken
let passwordMatchFlag


class UserController {

    static register(req, res, next) {
        console.log(`>>> CONTROLLERS/USER: REGISTER`);
        console.log("CREDENTIALS:");
        console.log(req.body);

        User.findOne({
            where: {
                email: req.body.email
            }
        })
        .then(result => {
            // console.log("VERDICT 1");
            // console.log(result);
            if(result) {
                throw new customError(400, 'EMAIL IS TAKEN')
            } else {
                console.log("LET'S CREATE NEW USER!");
                return User.create({
                    email: req.body.email,
                    password: req.body.password,
                    location: req.body.location
                })
            }
        })
        .then(result1 => {
            console.log("USER REGISTERED");
            console.log(result1);
            // userId = result.dataValues.id
            // emailAddress = result.dataValues.email
           res.status(201).json({result: result1})

        })
        .catch(err => {
            console.log("ERROR REGISTERING USER");
            // console.log(err);
            next(err)
        })
    }


    static login(req, res, next) {
        console.log(`>>> CONTROLLERS/USER: LOGIN `);
        console.log("CREDENTIALS:");
        console.log(req.body);
        emailAddress =  req.body.email
        passcode = req.body.password

        User.findOne({
            where: {
                email: emailAddress
            }
        })
        .then(response => {
            // console.log(`DOES USER FOUND?`);
            // console.log(response);
            
            if(response) {

                // console.log(`RETRIEVED USER IS`);
                // console.log(response);

                passwordMatchFlag = checkPassword(passcode, response.password)
            // console.log(`does matching password success: ${passwordMatchFlag}`);

                if (passwordMatchFlag) {
                    console.log(`LOGIN SUCCESS`);
                    payload = {
                        id: response.id,
                        email: emailAddress,
                        location: response.location
                    }
                    // console.log(`payload is`);
                    // console.log(payload);
                    accessToken = createToken(payload)

                    // console.log(`generated token`);
                    // console.log(accessToken);
                    // req.headers.accessToken = accessToken;
                    // console.log("req.headers.token is: \n");
                    // console.log(req.headers.token);
               
                    // req.payload = payload
                    res.status(200).json({access_token: accessToken})
                } else {
                    throw new customError(400, "WRONG PASSWORD/EMAIL")
                }
            } else {
                throw new customError(400, "WRONG PASSWORD/EMAIL")
            }
        })
        .catch(err => {
            console.log("ERROR LOGIN");
            // console.log(err);
            next(err)
        })
    }

    static googleLogin(req, res, next) {
        console.log(`>>> GOOGLE LOGIN <<<`);
        console.log("CREDENTIALS:");
        accessToken = req.headers.token
        console.log(accessToken,'<---- ACCESS TOKEN END ');
        googleClient.verifyIdToken({
            idToken: accessToken,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        .then(ticket => {
            console.log(`TICKET FOUND!`);
            console.log(ticket);
            payload = ticket.getPayload();
            userId = payload['sub']
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
            if(result1.length === 0) {

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
            res.status(200).json({token: createToken(payload)})
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
                res.status(200).json({result})
            })
            .catch(err => {
                console.log("ERROR FETCHING ALL USERS");
                next(err)
            }) 
    }

}

module.exports = UserController