const projectRoute = require('express').Router()
const ProjectController = require('../controllers/project')
const { authentication } = require('../middleware/authentication')
const { authorization } = require('../middleware/authorization')
const { po_authorization } = require('../middleware/po_authorization')

projectRoute.use(authentication)

projectRoute.get('/', ProjectController.fetchProjects)
projectRoute.get('/:id', ProjectController.getProjectById)
projectRoute.post('/', ProjectController.createProject)
projectRoute.post('/invite', ProjectController.invite)

// ONLY PROJECT OWNERS MAY UPDATE, OR DELETE ANY PROJECT
projectRoute.put('/:id', po_authorization, ProjectController.updateProject)
projectRoute.delete('/:id', po_authorization, ProjectController.dropProject)

/*
    ALL AUTHENTICATED USERS MAY FETCH, CREATE OR INVITE A PROJECT,
    BUT ONLY PROJECT MEMBERS MAY VIEW, CREATE, UPDATE OR DELETE THEIR OWN PROJECTS' TODOS
 */
projectRoute.get('/:projectid/todos', authorization, ProjectController.fetchTodos)
projectRoute.post('/:projectid/todos', authorization, ProjectController.createTodo)
projectRoute.put('/:projectid/todos/:todoid', authorization, ProjectController.updateTodo)
projectRoute.delete('/:projectid/todos/:todoid', authorization, ProjectController.deleteTodo)




module.exports = projectRoute