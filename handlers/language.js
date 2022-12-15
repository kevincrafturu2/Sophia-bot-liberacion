const csvParser = require('csv-parser')
const { createReadStream, readdirSync } = require('fs')

module.exports = handler

function handler(client) {
	readdirSync('./language').filter(file => file.endsWith('.csv')).forEach(file => {
		createReadStream(`./language/${file}`)
			.pipe(csvParser({}))
			.on('data', data => {
				client.language.set(data.key, delKey(data))
			})
	})
}

function delKey(data = {}) {
	delete data.key
	return data
}