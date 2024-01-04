const {User: user_model} = require('../models/models')
const uuid = require('uuid');
const TokenService = require('./token_service');
const bcrypt = require('bcrypt');
const ApiError = require('../error/ApiError')

class UserService {
    async registration(userName, password) {
        console.log('user service registration');
        const candidate = await user_model.findOne({where: {userName: userName}});
        console.log('candidate = ', candidate);
        if (candidate) {
            throw new Error('This user_name is already taken!');
        }
        const hash_password = await bcrypt.hash(password, 4);
        // const activation_link = uuid.v4();

        const user = await user_model.create({
            userName: userName,
            password: hash_password,
            role: 'USER',
        })
        // await mailService.sendActivationLink(email, `${process.env.API_URL}/api/user/activate/${activation_link}`);
        const tokens = await TokenService.generateTokens({id: user.id, userName}) //payload: email, id, shopAddress, else...
        await TokenService.saveToken(user.id, tokens.refresh_token);
        return { ...tokens, user: {user_id: user.id, userName}}
    }

    async login (userName, password) {
        const user = await user_model.findOne({where: {userName: userName}});
        if (!user) {
            throw ApiError.badRequest('Пользователь с таким user_name не найден');
        }

        const compare_passwords = await bcrypt.compare(password, user.password);
        if (!compare_passwords) {
            throw ApiError.badRequest('Не коректный пароль');
        }
        const {id, userName: user_name} = user;
        const tokens = await TokenService.generateTokens({id, userName: user_name});
        await TokenService.saveToken(id, tokens.refresh_token);
        return {...tokens, user: {user_id: id, userName: user_name}}
    }

    async logout(refresh_token) {
        const token = await TokenService.removeToken(refresh_token);
        return token;
    }

    async refresh(refresh_token) {
        if (!refresh_token) {
            throw ApiError.UnauthorizedError()
        }

        const user_data = await TokenService.validateRefreshToken(refresh_token);
        const token_from_db = await TokenService.findToken(refresh_token);
        if (!user_data || !token_from_db) {
            throw ApiError.UnauthorizedError()
        }
        const user = await user_model.findOne({where: {id: user_data.id}})
        const {id, userName} = user;
        const tokens = await TokenService.generateTokens({id, userName});
        await TokenService.saveToken(user.id, tokens.refresh_token);
        return {...tokens, user: {user_id: user.id, userName}}
    }
}

module.exports = new UserService();