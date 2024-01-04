const Router = require('express');
const router = new Router()
const usersController = require('../controllers/usersController')

router.get('/getAllUsers', usersController.gtAllUsers)

module.exports = router;