const Router = require('express')
const router = new Router()
const imageController = require('../controllers/imagesController')
const authMiddleware = require('../middlewares/auth_middleware');

router.post('/addImage', authMiddleware(['admin', 'team_lead', 'manager']), imageController.addImage)
router.get('/getAllImages', authMiddleware(['admin', 'team_lead', 'manager']), imageController.getAllImages)
router.get('/getCroppedImage/:imageId/:aspectRatio/:width', imageController.getCroppedImage)
router.get('/getTeamImages/:teamName', imageController.getTeamImages)

module.exports = router;