const express = require('express')
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
require('dotenv').config()

//Connecting to the DB
mongoose.connect('mongodb://localhost/messenger', { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useFindAndModify', false);
mongoose.connection.once('open', () => {
    console.log('Connection has been made')
}).on('error', (err) => console.log(`error:\n${err}`))

//Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    name: process.env.SESSION_NAME,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        collection: 'sessions'
    }),
    cookie: {
        maxAge: 1 * 1 * 60 * 60, // 1 hour
        sameSite: false
    }
}))

//Importing routes
const register = require('./routes/register')
const login = require('./routes/login')
const invite = require('./routes/invitations')
const friend = require('./routes/friends')
const profile = require('./routes/profile')

//Middlewares
app.use(express.json())
app.use('/uploads', express.static('uploads'))

//Route Middlewares
app.use('/api/user/register', register)
app.use('/api/user/login', login)
app.use('/api/user/invitations', invite)
app.use('/api/user/friends', friend)
app.use('/api/user/profile/', profile)

const PORT = process.env.PORT || 1234
 
app.listen(PORT, () => console.log(`I'm listening on port ${PORT}`))
