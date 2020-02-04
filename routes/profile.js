const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const verify = require('./verify_token')
var multer = require('multer')
const User = require('../models/User')
const Joi = require('@hapi/joi')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true)
    } else {
        cb(new Error("File must be JPEG/PNG").message, false) // TODO: error message
    }
}

const updateValidation = data => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(25).required(),
        new_username: Joi.string().alphanum().min(3).max(25).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(3).max(255).required()
    });

    return schema.validate(data);
}

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Up to 5 MB
    },
    fileFilter: fileFilter
})



router.patch('/update', verify, upload.single('userImage'), async (req, res) => {
    const { error } = updateValidation(req.body);
    if (error) return res.json({message: error.details[0].message });
    const userExists = await User.findOne({ username: req.body.new_username });
    if (userExists) return res.json({message: 'This username is already taken' });
    try {
         await User.findOneAndDelete({ username: req.body.username })
    } catch(err) {
        return res.send(err)
    }
    const user = new User({
        username: req.body.new_username,
        email: req.body.email,
        password: req.body.password,
        userImage: req.file.path
    })

    try {
        await user.save()
        return res.json(user)
    } catch(err) {
        console.log(err)
    }
})


module.exports = router