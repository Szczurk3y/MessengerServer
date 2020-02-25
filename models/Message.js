const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Message = new Schema({
    recipient: {
        type: String,
        min: 3,
        max: 25,
        required: true
    },
    message: {
        type: String,
        required: true
    }
})


const MessageSchema = mongoose.model('Message', Message);

module.exports = MessageSchema;