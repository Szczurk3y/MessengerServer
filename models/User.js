const mongoose = require('mongoose')
const Schema = mongoose.Schema
const multer = require('multer')

const UsersSchema = new Schema({
    username: {
        type: String,
        required: true,
        min: 3,
        max: 25
    },
    email: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    password: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    admin: {
        type: Boolean,
        required: false,
        default: false
    },
    userImage: {
        type: String,
        required: false,
        default: ""
    }
});

const User = mongoose.model('User', UsersSchema);

module.exports = User;