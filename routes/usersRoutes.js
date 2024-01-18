const Router = require('express');
const router = new Router()
const usersController = require('../controllers/usersController')

router.get('/getAllUsers', usersController.getAllUsers)
router.get('/getAllRoles', usersController.getAllRoles)

module.exports = router;