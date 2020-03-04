module.exports = (io) => {
    io.sockets.on('connection', (socket) => {
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
}