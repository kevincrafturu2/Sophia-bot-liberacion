const { readdirSync } = require('fs')
const { bgWhite, black } = require('colors')

module.exports = (client) => {
	readdirSync('./events/').forEach(() => {
		const events = readdirSync('./events/').filter((file) => file.endsWith('.js'))
		for (const file of events) {
			const pull = require(`../events/${file}`)
			if (pull.name) client.events.set(pull.name, pull)
			else continue
		}
	})
	console.log(bgWhite(black('Handler de Eventos listo.')))
}
