const jwt = require('jsonwebtoken');
const {UserToken} = require('../models/models');

class TokenService {
    generateTokens(payload) {
        const access_token = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '60m'});
        const refresh_token = jwt.sign(payload, process.env.JWT_REFRESH, {expiresIn: '3d'});
        return {access_token, refresh_token};
    }

    validateAccessToken(token) {
        try {
            const secret =  process.env.SECRET_KEY;
            return jwt.verify(token, secret);
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const refresh_token = process.env.JWT_REFRESH
            return jwt.verify(token, refresh_token);
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