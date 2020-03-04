module.exports = (io) => {
    io.sockets.on('connection', (socket) => {
        socket.on('create', function(userNickname, room) {
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

        // socket.on('disconnect', function(userNickname, room) {
        //     console.log(`${userNickname} has left`)
        //     io.sockets.in(room).emit("userdisconnect", `${userNickname} user has left`)
        // })
    })
}