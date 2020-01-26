const router = require('express').Router()
const verify = require('./verify_token')
const Joi = require('@hapi/joi')
const User = require('../models/User')
const Invitation = require('../models/Invitation')

// TODO: change posts to: delete/get/and so on...

const recipientValidation = data => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(25).required(),
        recipient: Joi.string().alphanum().min(3).max(25).required()
    })

    return schema.validate(data)
}

router.post('/', verify, async (req, res) => {
    try {
        const invitations = await Invitation.find({recipient: req.body.recipient})
        console.log(invitations)
        return res.json(invitations)
    } catch(err) {
        return res.send(err.message)
    }
})

router.post('/invite', verify, async (req, res) => {
    const { error } = recipientValidation(req.body)
    if(error) return res.send(error.details[0].message)
    const recipient = await User.findOne({username: req.body.recipient})
    if(!recipient) return res.send("User not found")

    const invitation = new Invitation({
        sender: req.body.username,
        recipient: recipient.username,
        sendTime: new Date().toUTCString().slice(5, 16) + ", " + new Date().toUTCString().slice(17,22)
    })

    try {
        await invitation.save()
        return res.send("Invitation has been sent!")
    } catch(err) {
        return res.send(err)
    }
})

module.exports = router