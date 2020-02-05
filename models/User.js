const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RegisteredUser = new Schema({
    username: {
        type: String,
        required: true,
        min: 3,
        max: 25
    },
    password: {
        type: String,
        required: false, // is required only during Login and Registration by Joi.required()
        min: 3,
        max: 255
    },
    email: {
        type: String,
        required: false, // is required only during registration by Joi.required()
        min: 3,
        max: 255
    },
    userImage: {
        type: String,
        required: false,
        default: ""
    },
    admin: {
        type: Boolean,
        required: false,
        default: false
    }
});


const User = mongoose.model('User', RegisteredUser);

module.exports = User;