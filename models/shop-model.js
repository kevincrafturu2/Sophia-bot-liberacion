const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	guildid: {
		type: String,
		required: true,
	},
	store: {
		type: Array,
		required: true,
	},
})

module.exports = mongoose.model('shop', schema)