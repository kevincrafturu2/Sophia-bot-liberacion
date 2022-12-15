const { Schema, model } = require('mongoose')

const schema = new Schema({
	ServerID: String,
	time: String,
	expire: String,
})

module.exports = model('PremiumGuilds', schema)
