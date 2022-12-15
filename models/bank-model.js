const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	guildid: {
		type: String,
		required: true,
	},
	userid: {
		type: String,
		required: true,
	},
	money: {
		type: Number,
		required: true,
	},
})

module.exports = mongoose.model('bank', schema)