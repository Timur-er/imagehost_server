const Router = require('express')
const router = new Router()
const imageController = require('../controllers/imagesController')
const authMiddleware = require('../middlewares/auth_middleware');

router.post('/addImage', authMiddleware, imageController.addImage)
router.get('/getAllImages', authMiddleware, imageController.getAllImages)
router.get('/getCroppedImage/:imageId/:aspectRatio/:width', imageController.getCroppedImage)
router.get('/getTeamImages/:teamId', imageController.getTeamImages)

module.exports = router;