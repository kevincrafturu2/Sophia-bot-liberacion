const { Schema, model } = require('mongoose')

const schema = new Schema({
	UserID: String,
	TimeMax: Number,
	Racha: Number,
	LongWord: String,
	Assertions: Number,
	NoAssertions: Number,
})

module.exports = model('quizTimeWord', schema)
