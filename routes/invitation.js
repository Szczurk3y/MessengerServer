const router = require('express').Router()
const jwt = require('jsonwebtoken')
const verify = require('./verify_token')
const Joi = require('@hapi/joi')
const User = require('../models/User')
const Invitation = require('../models/Invitation')

const recipientValidation = data => {
    const schema = Joi.object({
        recipient: Joi.string().alphanum().min(3).max(25).required()
    })

    return schema.validate(data)
}

router.post('/', verify, async (req, res) => {
    const { error } = recipientValidation(req.body.recipient)
    if(!error) return res.send(error.details[0].message)
    const recipient = await User.findOne({username: req.body.recipient})
    if(!recipient) return res.send("User not found")

    const invitation = new Invitation({
        sender: req.body.username,
        recipient: recipient.username
    })

    try {
        await invitation.save()
        return res.send("Invitation has been sent!")
    } catch(err) {
        return res.send(err)
    }
})

module.exports = router