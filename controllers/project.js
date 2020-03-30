const { Project, ProjectUser, Todo, User } = require("../models")
const { customError } = require("../helpers/customError.js")

let user_id
let project_id
let puid
let title
let category
let due
let task_id
let puser

class ProjectController {

    static fetchProjects(req, res, next) {
        console.log(">>> CONTROLLERS/PROJECT: FETCH PROJECTS");
        ProjectUser.findAll({
            where: {
                UserId: req.decoded.id
            },
            include: [
                {
                    model: Project,
                    attributes: {
                        exclude: [
                            'createdAt', 'updatedAt'
                        ]
                    }
                   
                },
                {
                    model: User,
                    attributes: {
                        exclude: [
                            'password', 'createdAt', 'updatedAt'
                        ]
                    }
                }
            ]
        })
        .then(response => {
            console.log("FETCHING ALL PROJECTS SUCCESS");
            res.status(200).json({result: response})
        })
        .catch(err => {
            console.log('ERROR FETCH ALL');
            next(err)
        })
    }

    static getProjectById(req, res, next) {
        console.log(">>> CONTROLLERS/PROJECT: FETCH PROJECT BY ID");
        ProjectUser.findOne({
            where: {
                id: +req.params.id,
                UserId: req.decoded.id
            },
            include: [
                {
                    model: Project,
                    attributes: {
                        exclude: [
                            'createdAt', 'updatedAt'
                        ]
                    }
                },
                {
                    model: User,
                    attributes: {
                        exclude: [
                            'password', 'createdAt', 'updatedAt'
                        ]
                    }
                }
            ]
        })
        .then(response => {
            
            if(response) {
                console.log("FETCH ONE PROJECT SUCCESS");
                res.status(200).json({result: response})
            } else {
                throw new customError(404, 'NOT FOUND')
            }
            
        })
        .catch(err => {
            console.log('ERROR FETCH ONE');
            next(err)
        })
    }

    static createProject(req, res, next) {
        console.log(">>> CONTROLLERS/PROJECT: CREATE NEW PROJECT");  

        Project.create({
            UserId: req.decoded.id,
            title: req.body.title
        })
        .then(response => {
            console.log("SUCCESS CREATING PROJECT");
            // console.log(response);
            user_id = response.UserId
            project_id = response.id

            return ProjectUser.create({
                UserId: user_id,
                ProjectId: project_id,
                include: [ User, Project ]
            })
        })
        .then(response2 => {
            console.log("SUCCESS CREATING PROJECTUSER");

            // console.log(response2);
            res.status(201).json({result: response2})

        })
        .catch(err => {
            next(err)
        })

    }

    static invite(req, res, next) {

        console.log(">>> CONTROLLERS/PROJECT: INVITE NEW PROJECT MEMBER");  
        project_id = +req.body.projectId

        // CHECK IF USER EXIST IN DATABASE
        User.findOne({
            where: {
                email: req.body.email
            }
        })
        .then(response => {

            // 
            if(response) {
                console.log("USER IS");
                // console.log(response);

                user_id = response.id
                
                // CHECK IF PROJECT HAS THAT MEMBER ALREADY
                return ProjectUser.findOne({
                    where: {
                        UserId: user_id,
                        ProjectId: project_id
                    }
                })

            } else {
                throw new customError(404, 'NOT FOUND')
            }
        })
        .then(response1 => {

            console.log("WHAT'S VERDICT?");
            // console.log(response1);

            if(response1) {
                console.log("USER HAS BEEN ASSIGNED!");
                throw new customError(400, 'DUPLICATE ASSIGNMENT')
            } else {
                console.log("WELCOME, NEW MEMBER!");
                return ProjectUser.create({
                    UserId: user_id,
                    ProjectId: project_id
                })
            }

        })
        .then(response2 => {
            console.log("ASSIGNING NEW MEMBER SUCCESSFUL");
            console.log(response2);
            res.status(201).json({result: response2})
        })
        .catch(err => {
            next(err)
        })


    }

}

module.exports = ProjectController