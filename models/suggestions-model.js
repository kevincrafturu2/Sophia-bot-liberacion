const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	guildid: {
		type: String,
		required: true,
	},
	channelid: {
		type: String,
		required: true,
	},
})

module.exports = mongoose.model('suggestion', schema)
