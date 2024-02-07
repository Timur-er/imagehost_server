const userService = require('../services/user_service')

const cookieConfig = {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: false,
    httpOnly: true,
}

class UserController {
    async registration(req, res) {
        try {
            const { email, password, roleId, teamId} = req.body;
            await userService.registration(email, password, roleId, teamId)
            return res.json("The user has been successfully registered!")
        } catch (e) {
            console.log(e);
        }
    }

    async login(req, res, next){
        try {
            const {userName, password} = req.body;
            const user_data = await userService.login(userName, password);
            res.cookie('refresh_token', user_data.refresh_token, cookieConfig);
            return res.json(user_data);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refresh_token} = req.cookies;
            console.log('refresh token from controller - ', refresh_token);
            const userData = await userService.refresh(refresh_token);
            console.log('user data from controller - ', userData);
            res.cookie('refresh_token', userData.refresh_token, cookieConfig);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new UserController()