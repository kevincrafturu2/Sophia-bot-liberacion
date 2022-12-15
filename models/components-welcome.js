const { Schema, model } = require('mongoose')

const schema = new Schema({
	ServerID: String,
	Title: String,
	Description: String,
	Footer: String,
	Imagen: String,
})

module.exports = model('welcomes-components', schema)
