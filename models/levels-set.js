const { Schema, model } = require('mongoose')

const schema = new Schema({
	ServerID: {
		type:   String,
		required: true,
	},
	Set: {
		type: String,
		default: 'false',
	},
	ChannelSend: {
		type: String,
		default: 'Not defined',
	},
})

module.exports = model('Levels-Power', schema)