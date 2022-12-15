const { Schema, model } = require('mongoose'),
	captchaSchema = new Schema({
		enable: {
			type: Boolean,
			required: true,
			default: false,
		},
		role: {
			type: String,
			required: false,
			default: '',
		},
		channel: {
			type: String,
			required: false,
			default: '',
		},
		guild: {
			type: Number,
			required: true,
		},
	})

module.exports = model('captcha', captchaSchema)
