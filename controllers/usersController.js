const {User, Role, Team, UserToken, Image} = require('../models/models')
const sequelize = require('../db');

class UsersController {
    async getAllUsers(req, res) {
        try {
            const teamId = req.user.teamId;
            const response = await User.findAll({
                include: [Role, Team],
                where: {
                    teamId: teamId
                }
            })
            res.json(response)
        } catch (e) {
            console.log(e);
        }
    }

    async getAllRoles(req, res) {
        try {
            const response = await Role.findAll()
            res.json(response)
        } catch (e) {
            console.log(e);
        }
    }

    async removeUser(req, res){
        const transaction = await sequelize.transaction();
        try {
            const newUserId = req.user.id;
            const deletedUserId = req.params.id;
            await Image.update({ userId: newUserId }, { where: { userId: deletedUserId } }, { transaction });
            await UserToken.destroy({ where: { user_id: deletedUserId } }, { transaction });
            await User.destroy({ where: { id: deletedUserId } }, { transaction });
            await transaction.commit();
            return res.json({ message: "User deleted successfully!" });
        } catch (e) {
            await transaction.rollback();
            console.log(e);
        }
    }
}

module.exports = new UsersController()