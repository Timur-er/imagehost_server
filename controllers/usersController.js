const {User, Role, Team} = require('../models/models')
class UsersController {
    async getAllUsers (req, res) {
        try {
            const response = await User.findAll({include: [Role, Team]})
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