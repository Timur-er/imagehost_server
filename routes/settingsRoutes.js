const Router = require("express");
const router = new Router()
const settingsController = require('../controllers/settingsController')
const authMiddleware = require('../middlewares/auth_middleware')

router.post('/createNewTeam', settingsController.createNewTeam)
router.get('/getAllTeams', authMiddleware(['admin']), settingsController.getAllTeams)

module.exports = router;