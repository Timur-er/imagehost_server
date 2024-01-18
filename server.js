require('dotenv').config()
const cookieParser = require('cookie-parser');
const express = require('express')
const path = require('path');
const cors = require('cors');
const sequelize = require('./db')
const router = require('./routes/index')
const {Role} = require('./models/models')

const PORT = process.env.PORT || 8000;

const options = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    exposedHeaders: ['Content-Disposition']
}

const app = express()
app.use(cors(options))
app.use(express.json())
app.use(cookieParser());
app.use('/api', router)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

async function createInitialRoles() {
    const roles = ['admin', 'team_lead', 'manager'];
    for (const roleName of roles) {
        await Role.findOrCreate({
            where: { name: roleName },
        });
    }
}

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync().then(() => {
            console.log("Database synced");
            createInitialRoles().then(() => {
                console.log("Initial roles created");
            });
        });

        app.listen(PORT, () => {
            console.log('server started on port: ',  PORT)
        })
    } catch (e) {
        console.log(e)
    }
}

start()

