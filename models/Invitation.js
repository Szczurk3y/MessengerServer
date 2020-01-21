const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const InvitationSchema = new Schema({
    sender: {
        type: String,
        required: true,
        min: 3,
        max: 25
    },
    recipient: {
        type: String,
        required: true,
        min: 3,
        max: 25
    }, 
    sendTime: {
        type: Date,
        default: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    }
})

const Invitation = mongoose.model("Invitations", InvitationSchema);
module.exports = Invitation