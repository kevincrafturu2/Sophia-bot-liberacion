const { Schema, model } = require('mongoose')

const schema = new Schema({
	UserID: String,
})

module.exports = model('eliminados-del-bot', schema)
