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
	inventory: {
		type: Array,
		required: true,
	},
})

module.exports = mongoose.model('Inventory', schema)