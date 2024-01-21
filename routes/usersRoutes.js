const Router = require('express');
const router = new Router()
const usersController = require('../controllers/usersController')
const authMiddleware = require("../middlewares/auth_middleware");

router.get('/getAllUsers', authMiddleware(['admin', 'team_lead']),usersController.getAllUsers)
router.get('/getAllRoles', authMiddleware(['admin', 'team_lead']), usersController.getAllRoles)
router.delete('/removeUser/:id', authMiddleware(['admin', 'team_lead']), usersController.removeUser)

module.exports = router;