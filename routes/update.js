const express = require('express')
const router = express.Router()
const verify = require('./verify_token')
var multer = require('multer')
const Joi = require('@hapi/joi')
const fs = require('fs')
const User = require('../models/User')
const Friends = require('../models/Friend')
const Invitations = require('../models/Invitation')
const bcrypt = require('bcryptjs')


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
        username: Joi.string().alphanum().min(3).max(25).required(),
        email: Joi.string().min(6).max(255).email().required(),
        password: Joi.string().min(3).max(255).required()
    })

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
        const existingUser = await User.findOne({email: req.body.email})
        if (!existingUser) return res.send("user not found") // If somehow user wasn't found in database... xd
        if (existingUser.userImage != "") { // to remove last picture i first check if there was an old picture for sure. "" means there wasn't
            fs.unlink(`${existingUser.userImage}`, (err) => {
                console.log("done")
                if(err) console.log(err)
            })    
        } 

        if (req.body.username != existingUser.username) { // If username and new username are not the same then i change invitations to show users his updated username and the same with friends
            patchInvitations(existingUser.username, req.body.username)
            patchFriends(existingUser.username, req.body.username)
        }
        
        const salt = await bcrypt.genSalt(10);

        var image = req.file ? req.file.path : "" // it checks whether user wants to update his profile picture or not, if wants, req.file will contain a picture so image = req.file.path
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        await User.findOneAndUpdate(
            { email: req.body.email },
            { 
                $set: { 
                    username: req.body.username,
                    password: hashedPassword,
                    userImage: image
                }
            }
        )
        return res.json({
            username: req.body.username,
            password: hashedPassword,
            userImage: image
        })
    } catch(err) {
        console.log(err)
        return res.send(err)
    }
})

async function patchInvitations(old_username, new_username) {
    try {
        await Invitations.updateMany(
            { recipient: old_username },
            { 
                $set: { recipient: new_username }
            }
        )
        await Invitations.updateMany(
            { sender: old_username },
            {
                $set: { sender: new_username }
            } 
        )
    } catch(err) {
        return err
    }
}

async function patchFriends(old_username, new_username) {
    try {
        await Friends.updateMany(
            { friend: old_username },
            {
                $set: { friend: new_username }
            }
        )
        await Friends.updateMany(
            { username: old_username },
            {
                $set: { username: new_username }
            }
        )
    } catch (err) {
        return err
    }
}

module.exports = router