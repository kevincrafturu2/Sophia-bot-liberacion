const { Schema, model } = require('mongoose')

const schema = new Schema({
	ServerID: String,
	ChannelID: String,
	Panels: Array,
})

module.exports = model('tickets', schema)
