const mongoose = require('mongoose')
const Schema = require('mongoose').Schema

const FriendSchema = new Schema({
    username: {
        type: String,
        min: 3,
        max: 25,
        required: true
    },
    friend: {
        type: String,
        min: 3,
        max: 25,
        required: true
    }
})

const Friend = mongoose.model("Friends", FriendSchema)
module.exports = Friend