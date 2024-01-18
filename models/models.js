const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const Image = sequelize.define('Image', {
    imageName: {type: DataTypes.STRING, allowNull: false},
    userId: { type: DataTypes.INTEGER, allowNull: false },
    fileName: {type: DataTypes.STRING, allowNull: false},
    filePath: {type: DataTypes.STRING, allowNull: false}
}, { timestamps: false })

const User = sequelize.define('User', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: {type: DataTypes.STRING},
    roleId: { type: DataTypes.INTEGER, allowNull: false },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: true, // allowNull true if a user can exist without a team
        references: {
            model: 'Teams', // 'teams' refers to table name
            key: 'id', // 'id' refers to column name in teams table
        }
    }
}, { timestamps: false })

const Role = sequelize.define('Role', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false });

const Team = sequelize.define('Team', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false });

const CroppingSettings = sequelize.define('CroppingSettings', {
    aspectRatio: {type: DataTypes.STRING,  allowNull: false},
    width: {type: DataTypes.INTEGER,  allowNull: false},
    height: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    left: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    top: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {timestamps: false})

const UserToken = sequelize.define('UserToken', {
    user_id: {type: DataTypes.INTEGER},
    refresh_token: {type: DataTypes.STRING, required: true}
}, { timestamps: false })

Image.hasMany(CroppingSettings, {foreignKey: 'imageId'})
CroppingSettings.belongsTo(Image, { foreignKey: 'imageId' });

User.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(User, { foreignKey: 'roleId' });

// One Team can have many Users
Team.hasMany(User, { foreignKey: 'teamId' });
// Each User belongs to one Team
User.belongsTo(Team, { foreignKey: 'teamId' });

User.hasMany(Image, { foreignKey: 'userId' });
Image.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    Image, CroppingSettings, User, UserToken, Role, Team
}
