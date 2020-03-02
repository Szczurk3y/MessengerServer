const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io').listen(server)
const mongoose = require('mongoose')
require('dotenv').config()

io.on('connection', (socket) => {
    console.log("User connected")
    socket.on('join', function(userNickname) {
        console.log(userNickname + " : has joined the chat ")
        socket.broadcast.emit('userjoinedthechat', userNickname + " : has joined the chat")
    })

    socket.on('messagedetection', (senderNickname, messageContent) => {
        console.log(senderNickname + " : " + messageContent)

        let message = {
            "message": messageContent,
            "senderNickname": senderNickname
        }

        io.emit('message', message)
    })

    socket.on('disconnect', function() {
        console.log('user has left')
        socket.broadcast.emit("userdisconnect", ' user has left')
    })
})

//Connecting to the DB
mongoose.connect('mongodb://localhost/messenger', { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useFindAndModify', false);
mongoose.connection.once('open', () => {
    console.log('Connection has been made')
}).on('error', (err) => console.log(`error:\n${err}`))


//Importing routes
const register = require('./routes/register')
const login = require('./routes/login')
const invite = require('./routes/invitations')
const friend = require('./routes/friends')
const profile = require('./routes/profile')
const messaging = require('./routes/messaging')

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

const PORT = process.env.PORT || 1235
 
server.listen(PORT, () => console.log(`I'm listening on port ${PORT}`))
