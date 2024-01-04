const Router = require('express')
const router = new Router()
const imageController = require('../controllers/imagesController')

router.post('/addImage', imageController.addImage)
router.get('/getAllImages', imageController.getAllImages)
router.get('/getCroppedImage/:imageId/:aspectRatio/:width', imageController.getCroppedImage)

module.exports = router;