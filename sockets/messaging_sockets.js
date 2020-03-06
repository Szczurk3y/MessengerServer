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
            const date = new Date().toUTCString().slice(5, 16) + ", " + new Date().toUTCString().slice(17,22)
            let message = {
                "message": messageContent,
                "senderNickname": senderNickname,
                "date": date
            }

            io.sockets.in(room).emit('message', message)
        })

        socket.on('disconnect', async () => {
            
        })

        socket.on('save_conversation', async (userNickname, conversation, friendNickname) => {
            await mongoose.connect(`mongodb://localhost/${userNickname}`, { useNewUrlParser: true, useUnifiedTopology: true })

            let final_list
            try {
                final_list = JSON.parse(conversation)
            } catch(err) {
                
            }
            console.log(typeof conversation)
            console.log(typeof final_list)
            console.log(final_list)

            const Message = require('../models/Message')(friendNickname)

            const message = new Message({
                sender: final_list[0].nickname,
                message: final_list[0].message,
                date: final_list[0].date
            })

            message.save()

            await mongoose.connect('mongodb://localhost/messenger', { useNewUrlParser: true, useUnifiedTopology: true })
        })
    })
}