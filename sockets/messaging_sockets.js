const mongoose = require('mongoose')

module.exports = (io) => {
    io.sockets.on('connection', (socket) => {
        socket.on('create', async (userNickname, room) => {
            socket.join(room)
            console.log(userNickname + " : has joined the chat ")
            io.sockets.in(room).emit('userjoinedthechat', userNickname + " : has joined the chat")
        })

        socket.on('messagedetection', (senderNickname, messageContent, room) => {
            console.log(senderNickname + " : " + messageContent)
            const date = new Date().toUTCString().slice(5, 16) + ", " + new Date().toUTCString().slice(17,22)
            let message = {
                "message": messageContent,
                "senderNickname": senderNickname,
                "date": date
            }

            io.sockets.in(room).emit('message', message)
        })

        socket.on('save_conversation', async (userNickname, conversation, friendNickname) => {
            await mongoose.connect(`mongodb://localhost/${userNickname}`, { useNewUrlParser: true, useUnifiedTopology: true })

            try {
                const final_list = JSON.parse(conversation)
                const Message = require('../models/Message')(friendNickname)
                Message.insertMany(final_list)
                console.log(final_list)
            } catch(err) {
                console.log(err)
            }

            await mongoose.connect('mongodb://localhost/messenger', { useNewUrlParser: true, useUnifiedTopology: true })
        })
    })
}