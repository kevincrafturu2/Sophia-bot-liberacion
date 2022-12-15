const { Schema, model } = require('mongoose')

const schema = new Schema({
	ServerID: String,
	ChannelID: String,
})

module.exports = model('Leave', schema)
