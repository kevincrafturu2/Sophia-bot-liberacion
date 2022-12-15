const { Schema, model } = require('mongoose')

const schema = new Schema({
	ServerID: String,
	ChannelID: String,
	RolID: String,
})

module.exports = model('VerificationButton', schema)
