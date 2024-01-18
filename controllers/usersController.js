const {User, Role} = require('../models/models')
class UsersController {
    async gtAllUsers (req, res) {
        try {
            console.log('get all users')
            const response = await User.findAll({include: [Role]})
            res.json(response)
        } catch (e) {
            console.log(e);
        }
    }

    async getAllRoles (req, res) {
        try {
            console.log('get roles')
            const response = await Role.findAll()
            res.json(response)
        } catch (e) {
            console.log(e);

        }
    }
}

module.exports = new UsersController()