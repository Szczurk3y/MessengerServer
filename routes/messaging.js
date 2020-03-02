const router = require('express').Router()
const verify = require('./verify_token')
const mongoose = require('mongoose')
const Joi = require('@hapi/joi')
const User = require('../models/User')

const validation = data => {
    const schema = Joi.object({
        username: Joi.string().required().min(3).max(25).alphanum(),
        recipient: Joi.string().required().min(3).max(25).alphanum(),
        message: Joi.string().required().min(1).max(255)
    })

    return schema.validate(data)
}

router.post('/message', verify, async (req, res) => {
    const { error } = validation(req.body)
    if (error) return res.json({ message: error.details[0].message })
    const isRecipientExists = await User.findOne({username: req.body.recipient})
    if (!isRecipientExists) return res.json({message: "Recipient not found"})
    
    await mongoose.connection.collection(`${req.body.username}`).insertOne({
        recipient: req.body.recipient,
        message: req.body.message
    }).then(() => {
        return res.send("wysłano")
    })

})

// io.on('connection', (socket) => {
//     console.log("User connected")
//     socket.on('join', function(userNickname) {
//         console.log(userNickname + " : has joined the chat ")
//         socket.broadcast.emit('userjoinedthechat', userNickname + " : has joined the chat")
//     })

//     socket.on('messagedetection', (senderNickname, messageContent) => {
//         console.log(senderNickname + " : " + messageContent)

//         let message = {
//             "message": messageContent,
//             "senderNickname": senderNickname
//         }

//         io.emit('message', message)
//     })

//     socket.on('disconnect', function() {
//         console.log('user has left')
//         socket.broadcast.emit("userdisconnect", ' user has left')
//     })
// })

module.exports = router
