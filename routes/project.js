const projectRoute = require('express').Router()
const ProjectController = require('../controllers/project')
const { authentication } = require('../middleware/authentication')
const { authorization } = require('../middleware/authorization')


projectRoute.use(authentication)

projectRoute.get('/', ProjectController.fetchProjects)
projectRoute.get('/:id', ProjectController.getProjectById)
projectRoute.post('/', ProjectController.createProject)
projectRoute.post('/invite', ProjectController.invite)

// projectRoute.post('/todos', authorization, ProjectController.createTodo)
// projectRoute.put('/todos/:id', authorization, ProjectController.updateTodo)
// projectRoute.delete('/todos/:id', authorization, ProjectController.deleteTodo)




module.exports = projectRoute