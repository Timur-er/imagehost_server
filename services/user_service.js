const {User: user_model, Role, Team} = require('../models/models')
const TokenService = require('./token_service');
const bcrypt = require('bcrypt');
const ApiError = require('../error/ApiError')

class UserService {
    async registration(email, password, roleId, teamId) {
        const candidate = await user_model.findOne({where: {email: email}});
        if (candidate) {
            throw new Error('This user_name is already taken!');
        }
        const hash_password = await bcrypt.hash(password, 4);

        const user = await user_model.create({
            email: email,
            password: hash_password,
            roleId: roleId,
            teamId: teamId
        })

        // const tokens = await TokenService.generateTokens({id: user.id, email}) //payload: email, id, shopAddress, else...
        // await TokenService.saveToken(user.id, tokens.refresh_token);
        // return { ...tokens, user: {user_id: user.id, email}}
    }

    async login(email, password) {
        const user = await user_model.findOne({
            where: {email: email}, include: [
                {model: Role, attributes: ['name']},
                {model: Team, attributes: ['id', 'name']}
            ]
        });
        if (!user) {
            throw ApiError.badRequest('Пользователь с таким user_name не найден');
        }

        const compare_passwords = await bcrypt.compare(password, user.password);
        if (!compare_passwords) {
            throw ApiError.badRequest('Не коректный пароль');
        }
        const {id, email: user_email} = user;
        // можна винести в сервіс...
        const tokens = TokenService.generateTokens({
            id,
            email: user_email,
            role: user.Role.name,
            team: user.Team.name,
            teamId: user.Team.id,
        });
        await TokenService.saveToken(id, tokens.refresh_token);
        return {...tokens, user: {user_id: id, email: user_email}}
    }

    async logout(refresh_token) {
        return await TokenService.removeToken(refresh_token);
    }

    async refresh(refresh_token) {
        if (!refresh_token) {
            throw ApiError.UnauthorizedError('Refresh token is required!')
        }

        const user_data = await TokenService.validateRefreshToken(refresh_token);
        const token_from_db = await TokenService.findToken(refresh_token);
        if (!user_data || !token_from_db) {
            throw ApiError.UnauthorizedError('Invalid refresh token')
        }
        const user = await user_model.findOne({
            where: {id: user_data.id},
            include: [
                {model: Role, attributes: ['name']},
                {model: Team, attributes: ['id', 'name']}
            ]
        })

        if (!user) {
            throw ApiError.UnauthorizedError('User not found');
        }

        const {id, email} = user;

        const tokens = TokenService.generateTokens({
            id,
            email,
            role: user.Role.name,
            teamId: user.Team.id,
            team: user.Team.name
        });
        await TokenService.saveToken(user.id, tokens.refresh_token);
        return {...tokens, user: {user_id: user.id, email}}
    }
}

module.exports = new UserService();