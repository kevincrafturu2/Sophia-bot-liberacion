const { Schema, model } = require('mongoose')

const niveles = new Schema({
	Set: {
		type: Boolean,
		default: false,
	},
	ServerID: {
		type:   String,
		required: true,
	},
	UserID: {
		type:   String,
		required: true,
	},
	XP: {
		type: Number,
		default: 0,
	},
	Nivel: {
		type: Number,
		default: 0,
	},
	Limit: {
		type: Number,
		default: 100,
	},
	ChannelSend: {
		type: String,
		default: 'Not defined',
	},
})

module.exports = model('Niveles', niveles)