const router = require('express').Router()
const verify = require('./verify_token')
const Friend = require('../models/Friend')
const Invitation = require('../models/Invitation')
const bcrypt = require('bcryptjs')

// TODO: change posts to: delete/get/and so on...

router.post('/', verify, async (req, res) => {
    try {
        const friends = await Friend.find({username: req.body.username})
        return res.json(friends)
    } catch(err) {
        return res.json(err.message)
    }
})

router.post('/delete', verify, async (req, res) => {
    try {
        await Friend.findOneAndDelete({
            username: req.body.username,
            friend: req.body.friend
        })
        await Friend.findOneAndDelete({
            username: req.body.friend,
            friend: req.body.username
        })
        return res.send("deleted.")
    } catch(err) {
        return res.send(err.message)
    }
})

router.post('/add', verify, async (req, res) => {
    try {
        const genSalt = await bcrypt.genSalt(10)
        const room = await bcrypt.hash(req.body.username + req.body.friend, genSalt)
        
        let friend = new Friend({
            username: req.body.username,
            friend: req.body.friend,
            chat_room: room
        })
        await friend.save()
        
        friend = new Friend({
            username: req.body.friend,
            friend: req.body.username,
            chat_room: room
        })
        await friend.save()

        await Invitation.findOneAndDelete({
            sender: req.body.friend,
            recipient: req.body.username
        })
        return res.send("added.")
    } catch(err) {
        return res.send(err.message)
    }
})

module.exports = router