const {
    Project,
    ProjectUser,
    Todo,
    User
} = require("../models")
const {
    customError
} = require("../helpers/customError.js")

let user_id
let project_id

class ProjectController {

    static fetchProjects(req, res, next) {
        return ProjectUser.findAll({
                where: {
                    UserId: req.decoded.id
                },
                order: [
                            ['updatedAt', 'DESC']
                        ],
                include: [
                    {
                        model: Project,
                        include: {
                            model: User,
                            attributes: {
                                exclude: [
                                    'password', 'createdAt', 'updatedAt'
                                ]
                            }
                        },
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

                if (response) {
                    return res.status(200).json({
                        data: response
                    })
                } else {
                    throw customError(404, 'NOT FOUND')
                }

            })
            .catch(err => {
                next(err)
            })
    }


    static getProjectById(req, res, next) {

        return ProjectUser.findOne({
                where: {
                    id: +req.params.id,
                    UserId: req.decoded.id
                },
                include: [
                    {
                        model: Project,
                        include: {
                            model: User,
                            attributes: {
                                exclude: [
                                    'password', 'createdAt', 'updatedAt'
                                ]
                            }
                        },
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
                if (response) {
                    res.status(200).json({
                        data: response
                    })
                } else {
                    throw new customError(404, 'NOT FOUND')
                }

            })
            .catch(err => {
                next(err)
            })
    }


    static createProject(req, res, next) {

        console.log("CONTROLLERS: CREATE PTOJECT");

        return Project.create({
                UserId: req.decoded.id,
                title: req.body.title
            })
            .then(response => {
                console.log("PROJECT CREATED");
                console.log(response);
                user_id = response.UserId
                project_id = response.id

                
                return ProjectUser.create({
                    UserId: user_id,
                    ProjectId: project_id,
                    include: [User, Project]
                })
            })
            .then(response => {
                console.log("PROJECT USER CREATED");
                console.log(response);
                return res.status(201).json({
                    data: response
                })

            })
            .catch(err => {
                console.log("ERROR CREATING PROJECT");
                next(err)
            })

    }


    static invite(req, res, next) {
        console.log("INVITE MEMBER FROM CONTROLLER");
        console.log(req.body);

        project_id = +req.body.projectId

        // CHECK IF USER EXIST IN DATABASE
        User.findOne({
                where: {
                    email: req.body.email
                }
            })
            .then(response => {

                // 
                if (response) {
                    console.log("USER FOUND");
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
            .then(response => {
                console.log("WHAT'S VERDICT2");
                console.log(response);
                if (response) {
                    throw new customError(400, 'DUPLICATE ASSIGNMENT')
                } else {
                    return ProjectUser.create({
                        UserId: user_id,
                        ProjectId: project_id
                    })
                }

            })
            .then(response => {
                console.log("INVITATION SENT");
                return res.status(201).json({
                    data: response
                })
            })
            .catch(err => {
                next(err)
            })

    }


    static updateProject(req, res, next) {
        Project.findOne({
                where: {
                    id: +req.params.id,
                    UserId: req.decoded.id
                },
                include: [{
                    model: User,
                    attributes: {
                        exclude: [
                            'password', 'createdAt', 'updatedAt'
                        ]
                    }
                }]
            })
            .then(response => {
                if (response) {
                    return Project.update({
                        title: req.body.title,
                        UserId: +req.body.userid
                    }, {
                        where: {
                            id: +req.params.id
                        },
                        returning: true
                    })

                } else {
                    throw new customError(404, 'NOT FOUND')
                }

            })
            .then(response => {
                res.status(200).json({
                    data: response[1][0]
                })
            })
            .catch(err => {
                next(err)
            })

    }


    static dropProject(req, res, next) {
        Project.findOne({
                where: {
                    id: +req.params.id,
                    UserId: req.decoded.id
                },
                include: [{
                    model: User,
                    attributes: {
                        exclude: [
                            'password', 'createdAt', 'updatedAt'
                        ]
                    }
                }]
            })
            .then(response => {
                if (response) {
                    return Project.destroy({
                        where: {
                            id: +req.params.id
                        }
                    })

                } else {
                    throw new customError(404, 'NOT FOUND')
                }

            })
            .then(response => {
                res.status(200).json({
                    data: response
                })
            })
            .catch(err => {
                next(err)
            })

    }


    static fetchTodos(req, res, next) {

        project_id = req.params.projectid

        return ProjectUser.findOne({
                where: {
                    UserId: req.decoded.id,
                    ProjectId: project_id
                }
            })
            .then(response => {
                if (response) {
                    return Todo.findAll({
                        where: {
                            ProjectId: response.ProjectId
                        },
                        include: [Project],
                        order: [
                            ['due_date', 'ASC']
                        ]
                    })

                } else {
                    throw new customError(404, 'NOT FOUND')
                }
            })
            .then(response => {
                return res.status(200).json({
                    data: response
                })
            })
            .catch(err => {
                next(err)
            })

    }


    static createTodo(req, res, next) {

        console.log("CREATING TODO");
        console.log(req.body);

        project_id = req.params.projectid

        ProjectUser.findOne({
                where: {
                    UserId: req.decoded.id,
                    ProjectId: project_id
                }
            })
            .then(response => {
                if (response) {

                    console.log("PROJECT FOUND");
                    console.log(response);

                    return Todo.create({
                        title: req.body.title,
                        description: req.body.description,
                        status: 'pending',
                        due_date: new Date(req.body.due_date),
                        ProjectId: project_id
                    })

                } else {
                    throw new customError(404, 'NOT FOUND')
                }
            })
            .then(response => {

                console.log("NEW TODO CREATED");
                console.log(response );
                return res.status(201).json({
                    data: response
                })
            })
            .catch(err => {
                next(err)
            })
    }


    static updateTodo(req, res, next) {

        // ENSURE PROJECT DO EXIST
        Project.findOne({
                where: {
                    id: +req.params.projectid
                }
            })
            .then(response => {

                if (response) {

                    // AND MAKE SURE THE TODO WE'RE LOOKING ABOUT DO EXIST!
                    return Todo.findOne({
                        where: {
                            id: +req.params.todoid
                        }
                    })
                } else {
                    throw new customError(404, 'NOT FOUND')
                }
            })
            .then(response => {

                if (response) {

                    return Todo.update({
                        title: req.body.title,
                        description: req.body.description,
                        status: req.body.status,
                        due_date: new Date(req.body.due_date)
                    }, {
                        where: {
                            id: +req.params.todoid,
                            ProjectId: project_id
                        },
                        returning: true
                    })

                } else {
                    throw new customError(404, 'NOT FOUND')
                }

            })
            .then(response => {
                res.status(200).json({
                    data: response
                })
            })
            .catch(err => {
                next(err)
            })

    }


    static deleteTodo(req, res, next) {

        // ENSURE PROJECT DO EXIST
        Project.findOne({
                where: {
                    id: +req.params.projectid
                }
            })
            .then(response => {

                if (response) {

                    // AND MAKE SURE THE TODO WE'RE LOOKING ABOUT DO EXIST!
                    return Todo.findOne({
                        where: {
                            id: +req.params.todoid
                        }
                    })

                } else {
                    throw new customError(404, 'NOT FOUND')
                }
            })
            .then(response => {
                if (response) {
                    return Todo.destroy({
                        where: {
                            id: +req.params.todoid,
                            ProjectId: project_id
                        },
                        returning: true
                    })
                } else {
                    throw new customError(404, 'NOT FOUND')
                }

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

}

module.exports = ProjectController