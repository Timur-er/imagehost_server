const Router = require('express')
const router = new Router()
const imageRouter = require('./imagesRoutes');
const userRouter = require('./userRoutes');
const usersRouter = require('./usersRoutes')

router.use('/image', imageRouter)
router.use('/user', userRouter)
router.use('/users', usersRouter)

module.exports = router;