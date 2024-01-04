const jwt = require('jsonwebtoken');
const {UserToken} = require('../models/models');

class TokenService {
    async generateTokens(payload) {
        const access_token = await jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '60m'});
        const refresh_token = await jwt.sign(payload, process.env.JWT_REFRESH, {expiresIn: '30d'});
        return {access_token, refresh_token};
    }

    async validateAccessToken(token) {
        try {
            const secret =  process.env.SECRET_KEY;
            const user_data = await jwt.verify(token, secret);
            return user_data;
        } catch (e) {
            return null;
        }
    }

    async validateRefreshToken(token) {
        try {
            const refresh_token = process.env.JWT_REFRESH
            const user_data = await jwt.verify(token, refresh_token);
            return user_data;
        } catch (e) {
            return null;
        }
    }

    async saveToken(user_id, refresh_token) {
        const token_data = await UserToken.findOne({user_id})
        if (token_data) {
            token_data.refresh_token = refresh_token;
            return token_data.save()
        }
        return await UserToken.create({user_id, refresh_token});
    }

    async removeToken(refresh_token) {
        const token_data = await UserToken.findOne({where: {refresh_token}});
        await token_data.destroy();
        return token_data;
    }

    async findToken(refresh_token) {
        return await UserToken.findOne({where: {refresh_token}});
    }
}

module.exports = new TokenService();