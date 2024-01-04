const {User} = require('../models/models')
class UsersController {
    async gtAllUsers (req, res) {
        try {
            console.log('get all users')
            const response = await User.findAll()
            res.json(response)
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new UsersController()