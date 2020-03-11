const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = (chat_name) => {
    const Message = new Schema({
        sender: String,
        message: String,
        date: String
    })
    if (!mongoose.models[`${chat_name}`]) {
        return mongoose.model(`${chat_name}`, Message, `${chat_name}`);
    } else {
        return mongoose.models[`${chat_name}`]
    }
};