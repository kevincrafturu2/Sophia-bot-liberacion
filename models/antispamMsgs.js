const { Schema, model } = require('mongoose')
module.exports = model('antispamMsgs', new Schema({ user: String, msgs: Number }))
