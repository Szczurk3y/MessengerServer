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
    if (!isRecipientExists) return res.json({message: "User not found"})
    
    await mongoose.connection.collection(`${req.body.username}`).insertOne({
        recipient: req.body.recipient,
        message: req.body.message
    }).then(() => {
        return res.send("wysłano")
    })

})


module.exports = router