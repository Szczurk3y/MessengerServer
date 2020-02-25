const express = require('express')
const router = express.Router()
const verify = require('./verify_token')
const mongoose = require('mongoose')

router.get('/message', verify, async (req, res) => {

})

router.post('/message', verify, async (req, res) => {
    await mongoose.connection[`${req.body.username}`].insert({
        recipient: req.body.recipient,
        message: req.body.message,
        
    })
})


module.exports = router