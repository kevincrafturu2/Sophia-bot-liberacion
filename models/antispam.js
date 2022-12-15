const { Schema, model } = require('mongoose')

const schema = new Schema({
	ServerID: String,
})

module.exports = model('AntiSpam', schema)
