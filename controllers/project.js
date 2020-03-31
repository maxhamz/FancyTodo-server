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
        ProjectUser.findAll({
                where: {
                    UserId: req.decoded.id
                },
                include: [{
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
                return res.status(200).json({
                    data: response
                })
            })
            .catch(err => {
                next(err)
            })
    }


    static getProjectById(req, res, next) {

        ProjectUser.findOne({
                where: {
                    id: +req.params.id,
                    UserId: req.decoded.id
                },
                include: [{
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

        Project.create({
                UserId: req.decoded.id,
                title: req.body.title
            })
            .then(response => {
                user_id = response.UserId
                project_id = response.id

                return ProjectUser.create({
                    UserId: user_id,
                    ProjectId: project_id,
                    include: [User, Project]
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


    static invite(req, res, next) {

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
            include: [
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
            res.status(201).json({data: response[1][0]})
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
            include: [
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
            res.status(201).json({data: response})
        })
        .catch(err => {
            next(err)
        })

    }


    static fetchTodos(req, res, next) {

        project_id = req.params.projectid

        ProjectUser.findOne({
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
                        include: [Project]
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

        project_id = req.params.projectid

        ProjectUser.findOne({
                where: {
                    UserId: req.decoded.id,
                    ProjectId: project_id
                }
            })
            .then(response => {
                if (response) {
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
            
            if(response) {

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

            if(response) {

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
            res.status(201).json({data: response})
        })
        .catch(err => {
            next(err)
        })

    }


    static deleteTodo (req, res, next) {

        // ENSURE PROJECT DO EXIST
        Project.findOne({
            where: {
                id: +req.params.projectid
            }
        })
        .then(response => {
            
            if(response) {

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
            if(response) {
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
            res.status(201).json({data: response})
        })
        .catch(err => {
            next(err)
        })

    }

}

module.exports = ProjectController