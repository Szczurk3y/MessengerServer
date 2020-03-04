const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io').listen(server)
const mongoose = require('mongoose')
require('dotenv').config()

//Importing routes
const register = require('./routes/register')
const login = require('./routes/login')
const invite = require('./routes/invitations')
const friend = require('./routes/friends')
const profile = require('./routes/profile')
const messaging = require('./routes/messaging')

//Importing sockets
require('./sockets/messaging_sockets')(io)

//Middlewares
app.use(express.json())
app.use('/uploads', express.static('uploads'))

//Route Middlewares
app.use('/api/user/register', register)
app.use('/api/user/login', login)
app.use('/api/user/invitations', invite)
app.use('/api/user/friends', friend)
app.use('/api/user/profile/', profile)
app.use('/api/user/messaging', messaging)

//Connecting to the DB
mongoose.connect('mongodb://localhost/messenger', { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useFindAndModify', false);
mongoose.connection.once('open', () => {
    console.log('Connection has been made')
}).on('error', (err) => console.log(`error:\n${err}`))

//Starting server
const PORT = process.env.PORT || 1235
server.listen(PORT, () => console.log(`I'm listening on port ${PORT}`))
