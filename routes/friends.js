const router = require('express').Router()
const verify = require('./verify_token')
const Friend = require('../models/Friend')
const Joi = require('@hapi/joi')

// TODO: change posts to: delete/get/and so on...

router.post('/', verify, async (req, res) => {
    try {
        const friends = await Friend.find({username: req.body.username})
        console.log(friends)
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
        return res.send("Deleted")
    } catch(err) {
        return res.send(err.message)
    }
})

router.post('/add', verify, async (req, res) => {
    try {
        let friend = new Friend({
            username: req.body.username,
            friend: req.body.friend
        })
        await friend.save()
        friend = new Friend({
            username: req.body.friend,
            friend: req.body.username
        })
        await friend.save()
        return res.send("added")
    } catch(err) {
        return res.send(err.message)
    }
})

module.exports = router