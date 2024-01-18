const {Team} = require('../models/models')
class SettingsController {
    async createNewTeam (req, res) {
        try {
            const {teamName} = req.body;
            const team = await Team.create({name: teamName})

            console.log(teamName);
            console.log('create new team');
            return res.json('Team created successfully!')
        } catch (e) {
            console.log(e);
        }
    }

    async getAllTeams(req, res) {
        try {
            const teams = await Team.findAll()
            return res.json(teams)
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new SettingsController();