const express = require('express')
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
require('dotenv').config()

//Connecting to the DB
mongoose.connect('mongodb://localhost/messenger', { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connection.once('open', () => {
    console.log('Connection has been made')
}).on('error', (err) => console.log(`error:\n${err}`))

//Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    name: process.env.SESSION_NAME,
    saveUninitialized: true,
    store: new MongoStore({ 
        mongooseConnection: mongoose.connection,
    }),
    cookie: {
        maxAge: 1 * 1 * 60 * 60, // 1 hour
        sameSite: false
    }
}))

app.get('/', (req, res) => {
    req.session.username = "mobile username"
    res.send("ELO KURWA")
})
//Importing routes
const register = require('./routes/register')
const login = require('./routes/login')
const invite = require('./routes/invitation')

//Middlewares
app.use(express.json())

//Route Middlewares
app.use('/api/user/register', register)
app.use('/api/user/login', login)
app.use('/api/user/invite', invite)

const PORT = 1234
app.listen(PORT, () => console.log(`I'm listening on port ${PORT}`))