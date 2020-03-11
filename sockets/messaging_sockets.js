const mongoose = require('mongoose')

module.exports = (io) => {
    io.sockets.on('connection', (socket) => {
        socket.on('create', async (userNickname, room) => {
            socket.join(room)
            console.log(userNickname + " : has joined the chat ")
            io.sockets.in(room).emit('userjoinedthechat', userNickname + " : has joined the chat")
        })

        socket.on('messagedetection', async (senderNickname, friendNickname, messageContent, room) => {
            console.log(senderNickname + " : " + messageContent)
            const date = new Date().toUTCString().slice(5, 16) + ", " + new Date().toUTCString().slice(17,22)

            let message = {
                "message": messageContent,
                "sender": senderNickname,
                "date": date
            }

            await mongoose.connect(`mongodb://localhost/${senderNickname}`, { useNewUrlParser: true, useUnifiedTopology: true })
            let Message = require('../models/Message')(friendNickname)
            Message.insertMany(message)
            await mongoose.connect(`mongodb://localhost/${friendNickname}`, { useNewUrlParser: true, useUnifiedTopology: true })
            Message = require('../models/Message')(senderNickname)
            Message.insertMany(message)

            await mongoose.connect('mongodb://localhost/messenger', { useNewUrlParser: true, useUnifiedTopology: true })

            io.sockets.in(room).emit('message', message)

        })
    })
}