const userService = require('../services/user_service')

const cookieConfig = {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'none',
    secure: true,
    httpOnly: true,
}

class UserController {
    async registration(req, res) {
        try {
            const { email, password, roleId, teamId} = req.body;
            const user_data = await userService.registration(email, password, roleId, teamId)
            // res.cookie('refresh_token', user_data.refresh_token, cookieConfig);
            // return res.json(user_data);
            return res.json("The user has been successfully registered!")
        } catch (e) {
            console.log(e);
        }
    }

    async login(req, res, next){
        try {
            console.log('login stage');
            console.log('body: ', req.body);
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
            console.log('refresh stage');
            const {refresh_token} = req.cookies;
            const userData = await userService.refresh(refresh_token);
            res.cookie('refresh_token', userData.refresh_token, cookieConfig);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new UserController()