/* eslint-disable no-unused-vars */
const client = require('../index')
const levels = require('../models/levels')
const seting = require('../models/levels-set')

client.on('messageCreate', async (message) => {
	if (message.author.bot) return
	if (message.channel.type === 'dm') return

	const datos = await levels.findOne({ ServerID: message.guild.id, UserID: message.author.id })
	const data = await seting.findOne({ ServerID: message.guild.id })

	if (data && data.Set === 'false') return
	let XPRANDOM

	if (message.content.length <= 5) XPRANDOM = Math.floor(Math.random() * 3) + 1
	if (message.content.length >= 5 && message.content.length <= 30) XPRANDOM = Math.floor(Math.random() * 20) + 1
	if (message.content.length >= 30 && message.content.length <= 40) XPRANDOM = Math.floor(Math.random() * 30) + 1
	if (message.content.length >= 40 && message.content.length <= 50) XPRANDOM = Math.floor(Math.random() * 40) + 1
	if (message.content.length >= 50 && message.content.length <= 60) XPRANDOM = Math.floor(Math.random() * 50) + 1
	if (message.content.length >= 60 && message.content.length <= 70) XPRANDOM = Math.floor(Math.random() * 60) + 1
	if (message.content.length >= 70 && message.content.length <= 80) XPRANDOM = Math.floor(Math.random() * 70) + 1
	if (message.content.length >= 80 && message.content.length <= 90) XPRANDOM = Math.floor(Math.random() * 80) + 1
	if (message.content.length > 90) XPRANDOM = Math.floor(Math.random() * 90) + 1

	if (!datos) {
		const newdates = new levels({
			ServerID: message.guild.id,
			UserID: message.author.id,
			XP: XPRANDOM,
		})

		return await newdates.save()
	}

	const XPTOTAL = datos.XP + XPRANDOM

	if (XPTOTAL >= datos.Limit) {
		if (data && data.ChannelSend === 'Not defined') {
			message.channel.send({
				content: `**¡Felicitaciones!**, has subido de nivel ${message.author}, tu nuevo nivel es: **${datos.Nivel + 1}**`,
			})
		} else if (data && data.ChaannelSend && client.channels.cache.resolveId(data.ChaannelSend)) {
			client.channels.cache.get(`${data.ChaannelSend}`).send({
				content: `**¡Felicitaciones!**, has subido de nivel ${message.author}, tu nuevo nivel es: **${datos.Nivel + 1}**`,
			})
		} else {
			return
		}
		return await levels.findOneAndUpdate({
			ServerID: message.guild.id,
			UserID: message.author.id,
		}, {
			XP: XPTOTAL,
			Nivel: datos.Nivel + 1,
			Limit: datos.Limit + 500,
		})
	}
	await levels.findOneAndUpdate({
		ServerID: message.guild.id,
		UserID: message.author.id,
	}, {
		XP: XPTOTAL,
	})
})