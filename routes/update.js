const express = require('express')
const router = express.Router()
const verify = require('./verify_token')
var multer = require('multer')
const User = require('../models/User')
const Joi = require('@hapi/joi')
const fs = require('fs')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        const now = new Date().toISOString();
        const date = now.replace(/:/g, '-')
        cb(null, date + file.originalname);
    }
})

const updateValidation = data => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(0).max(25).required(),
        new_username: Joi.string().alphanum().min(3).max(25).required()
    });

    return schema.validate(data);
}

var fileFilter = async (req, file, cb) => {
    if (req.body.username === req.body.new_username) { // If an user wants just to perform a picture change, he will put his current username as a new_username, so to avoid error later, i signify new_username to current username
        req.body.new_username = req.body.username
    } else {
        var userExists = await User.findOne({ username: req.body.new_username })
    }
    if (userExists) {
        cb(new Error('This username is already taken'), false)
    } else if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true)
    } else {
        cb(new Error("File must be JPEG/PNG").message, false) // TODO: error message
    }
}

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Up to 5 MB
    },
    fileFilter: fileFilter
})



router.patch('/', verify, upload.single('userImage'), async (req, res) => {  
    const { error } = updateValidation(req.body);
    if (error) {
        if (req.file) { // if error occure, code below will remove saved picture to avoid rendundancy
            fs.unlink(req.file.path, (err) => {
                if(err) console.log(err)
            })
        }
        return res.send(error.details[0].message)
    } 
    try {
        var image = req.file ? req.file.path : "" // it checks whether user wants to update his profile picture or not, if wante, req.file will hold a picture so image = req.file.path  
        const existingUser = await User.findOne({username: req.body.username}); // It allows me to use later (10 lines below) unchanged a password, an email and an admin in order to commit update
        if (!existingUser) return res.send("user not found") // If somehow user wasn't found in database... xd
        if (existingUser.userImage != "") { // to remove last picture i first check if there was an old picture for sure. "" means there wasn't
            fs.unlink(`${existingUser.userImage}`, (err) => {
                console.log("done")
                if(err) console.log(err)
            })    
        }

        const new_user = new User({
            username: req.body.new_username,
            userImage: image,
            // Below parameters you can't update easily 
            password: existingUser.password,
            email: existingUser.email,
            admin: existingUser.admin
        })

        await User.findOneAndDelete({ username: req.body.username })
        await new_user.save()

        return res.json(new_user)
    } catch(err) {
        console.log(err)
        return res.send(err)
    }

    
})


module.exports = router