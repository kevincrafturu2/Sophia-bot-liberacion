const { Schema, model } = require('mongoose')

const schema = new Schema({
	ServerID: String,
	ChannelYTID: {
		type: String,
		default: 'Not defined',
	},
	ChannelID: {
		type: String,
		default: 'Not defined',
	},
	Title: {
		type: String,
		default: 'Not defined',
	},
	VideoID: {
		type: String,
		default: 'Not defined',
	},
	everyone: {
		type: Boolean,
		default: false,
	},
})

module.exports = model('yt-notification', schema)