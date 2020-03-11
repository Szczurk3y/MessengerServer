const router = require('express').Router()
const mongoose = require('mongoose')
const verify = require('../routes/verify_token')

router.get('/chats', verify, async(req, res) => {
    const username = req.query.username
    var chats = []
    
    await mongoose.connect(`mongodb://localhost/${username}`, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        mongoose.connection.db.listCollections().toArray(async (err, collections) => {
            collections.map(async item => {
                chats.push(JSON.parse(`{"friend":"${item.name}"}`))
            })
        })
    })

    await mongoose.connect('mongodb://localhost/messenger', { useNewUrlParser: true, useUnifiedTopology: true })

    console.log(chats)
    return res.json(chats)
})

router.get('/', verify, async (req, res) => {
    const username = req.query.username
    const friendname = req.query.friendname
    const Message = require('../models/Message')(friendname)
    
    await mongoose.connect(`mongodb://localhost/${username}`, { useNewUrlParser: true, useUnifiedTopology: true })

    const data = Message.find({})

    await mongoose.connect('mongodb://localhost/messenger', { useNewUrlParser: true, useUnifiedTopology: true })

    console.log(data)
    return res.json(data)
})


module.exports = router