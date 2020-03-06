const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = (room) => {
    const Message = new Schema({
        sender: String,
        message: String,
        date: String
    })
    if (!mongoose.models[`${room}`]) {
        return mongoose.model(`${room}`, Message, `${room}`);
    } else {
        return mongoose.models[`${room}`]
    }
};