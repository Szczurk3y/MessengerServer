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

var fileFilter = async (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
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

router.post('/', verify, upload.single('image'), async (req, res) => {
    var response
    const existingUser = await User.findOne({ email: req.body.email }) // Getting user before committing updates

    var { error } = updateValidation(req.body);
    if (error) {
        response = { 
            message: error.details[0].message,
            isUpdated: false
        }
        res.json(response)
    }

    var doesUserAlreadyExist = false
    if (req.body.username && req.body.username != existingUser.username) { // It checks whether desire new username is already taken by someone else
        doesUserAlreadyExist = await User.findOne({ username: req.body.username })
        if (doesUserAlreadyExist) {
            response = { 
                message: "This username is already taken",
                isUpdated: false
            }
            res.json(response)
        }
    }

    if (error || doesUserAlreadyExist) {
        if (req.file) { // if error occure, code below will remove saved picture to avoid rendundancy
            fs.unlink(req.file.path, (err) => {
                if(err) console.log(err)
            })
        }
        return
    }

    try {
        if (existingUser.userImage != "") { // to remove previous picture i first check if there was an old picture for sure. "" means there wasn't
            fs.unlink(`${existingUser.userImage}`, (err) => {
                console.log("Deleted previous image")
                if(err) console.log(err)
            })    
        }

        const salt = await bcrypt.genSalt(10);

        var new_image = req.file ? req.file.path : existingUser.userImage // it checks whether user wants to update his profile picture or not, if wants, req.file will contain a picture so image = req.file.path
        const new_hashedPassword = req.body.password ? await bcrypt.hash(req.body.password, salt) : existingUser.password // it checks whether user wants to update his password or not
        const new_username = req.body.username ? req.body.username : existingUser.username // it checks whether user wants to update his username or not
        await User.findOneAndUpdate( // Finding and updating user
            { email: req.body.email }, // Parameter to find
            { 
                $set: { // set new parameters
                    username: new_username,
                    password: new_hashedPassword,
                    userImage: new_image
                }
            }
        )

        if (new_username != existingUser.username) { // If username and new username are not the same then i change invitations to show users his updated username and the same with friends
            patchInvitations(existingUser.username, new_username)
            patchFriends(existingUser.username, new_username)
        }

        response = { 
            message: "Successfully updated",
            isUpdated: true
        }
        return res.json(response)
    } catch(err) {
        response = { 
            message: err,
            isUpdated: false
        }
        return res.json(response)
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

const updateValidation = data => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(25).optional(),
        email: Joi.string().min(6).max(255).email().required(),
        password: Joi.string().min(3).max(255).optional()
    })
    return schema.validate(data);
}


module.exports = router