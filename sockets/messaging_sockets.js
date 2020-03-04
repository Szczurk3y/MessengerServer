const mongoose = require('mongoose')

module.exports = (io) => {
    io.sockets.on('connection', (socket) => {
        socket.on('create', async function(userNickname, room) {
            socket.join(room)
            console.log(userNickname + " : has joined the chat ")
            io.sockets.in(room).emit('userjoinedthechat', userNickname + " : has joined the chat")
        })

        socket.on('messagedetection', (senderNickname, messageContent, room) => {
            console.log(senderNickname + " : " + messageContent)

            let message = {
                "message": messageContent,
                "senderNickname": senderNickname
            }

            io.sockets.in(room).emit('message', message)
        })

        socket.on('disconnect', async () => {
            
        })

        socket.on('save_conversation', async (userNickname, conversation, friendNickname) => {
            await mongoose.connect(`mongodb://localhost/${userNickname}`, { useNewUrlParser: true, useUnifiedTopology: false })

            const Message = require('../models/Message')(friendNickname)

            const message = new Message({
                message: conversation,
                date: new Date().toUTCString().slice(5, 16) + ", " + new Date().toUTCString().slice(17,22)
            })

            message.save()

            await mongoose.connect('mongodb://localhost/messenger', { useNewUrlParser: true, useUnifiedTopology: false })
        })
    })
} 