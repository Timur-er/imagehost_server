const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const Image = sequelize.define('Image', {
    imageName: {type: DataTypes.STRING, allowNull: false},
    fileName: {type: DataTypes.STRING, allowNull: false},
    filePath: {type: DataTypes.STRING, allowNull: false}
}, { timestamps: false })

const User = sequelize.define('User', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    userName: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING},
})

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
})

Image.hasMany(CroppingSettings, {foreignKey: 'imageId'})
CroppingSettings.belongsTo(Image, { foreignKey: 'imageId' });

module.exports = {
    Image, CroppingSettings, User, UserToken
}
