const Router = require('express');
const router = new Router()
const usersController = require('../controllers/usersController')

router.get('/getAllUsers', usersController.gtAllUsers)
router.get('/getAllRoles', usersController.getAllRoles)

module.exports = router;