const Router = require('express')
const router = new Router()
const imageController = require('../controllers/imagesController')
const authMiddleware = require('../middlewares/auth_middleware');

router.post('/addImage', authMiddleware(['admin', 'team_lead', 'manager']), imageController.addImage)
router.get('/getAllImages', authMiddleware(['admin', 'team_lead', 'manager']), imageController.getAllImages)
router.get('/getCroppedImage/:imageId/:aspectRatio/:width', imageController.getCroppedImage)
router.get('/getTeamImages/:teamName', authMiddleware(['admin', 'team_lead', 'manager']), imageController.getTeamImages)
router.post('scriptAddImage', imageController.getTeamImages)

module.exports = router;