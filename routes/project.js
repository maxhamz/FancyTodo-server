const projectRoute = require('express').Router()
const ProjectController = require('../controllers/project')
const { authentication } = require('../middleware/authentication')
const { authorization } = require('../middleware/authorization')


projectRoute.use(authentication)

projectRoute.get('/', ProjectController.fetchProjects)
projectRoute.get('/:id', ProjectController.getProjectById)
projectRoute.post('/', ProjectController.createProject)
projectRoute.post('/invite', ProjectController.invite)


/*
    ALL AUTHENTICATED USERS MAY FETCH, CREATE OR INVITE A PROJECT,
    BUT ONLY PROJECT MEMBERS MAY VIEW, CREATE, UPDATE OR DELETE THEIR OWN PROJECTS' TODOS
 */
projectRoute.get('/todos/:projectid', authorization, ProjectController.fetchTodos)
projectRoute.post('/todos/:projectid', authorization, ProjectController.createTodo)
// projectRoute.put('/todos/:projectid/:id', authorization, ProjectController.updateTodo)
// projectRoute.delete('/todos//:projectid/:id', authorization, ProjectController.deleteTodo)




module.exports = projectRoute