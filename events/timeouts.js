/* eslint-disable no-shadow */
const premiumGuild = require('../models/premiumGuild')
const blackuser = require('../models/blacklist-user')
const blackguild = require('../models/blacklist-guild')
const client = require('../index')
const { MessageEmbed } = require('discord.js-light')

client.on('ready', async () => {
	// await blackguild.deleteOne({ ServerID: "848053120852688917" })
	expireBlacklist(client, blackuser)
	expireBlacklist(client, blackguild)
	expirePremiun(client)
})

// Funciones timeout

const expirePremiun = async (client) => {
	setInterval(async () => {
		let data = await premiumGuild.find()

		if (data.length > 0) {
			const now = Math.floor(Date.now() / 1000)
			let array = data

			// eslint-disable-next-line no-inner-declarations
			function isExpirationTime(item) {
				if (item.expire == 0) return false
				if (item.expire - now <= 50) return true
				else return false
			}

			array = array.filter(isExpirationTime)

			for (const i in array) {
				try {
					data = array[i]

					const expire = data.expire
					const timeRemaining = (expire - now) * 1000

					const guild = client.guilds.cache.get(data.ServerID)

					setTimeout(async () => {
						await premiumGuild.deleteOne({ ServerID: guild.id })
						console.log('Se desactivó el premiun en', guild.name)
						client.channels.cache.get('979532908492644422').send({
							embeds: [
								new MessageEmbed()
									.setTitle('VIP FINALIZADO')
									.setDescription(
										'Se ha terminado el VIP de un servidor',
									)
									.addField('Servidor:', guild.name, true)
									.addField('ID:', guild.id, true)
									.addField('ID Owner:', guild.ownerId, true)
									.setColor('RED'),
							],
						})
					}, timeRemaining)
				} catch (error) {
					console.log(error)
				}
			}
		}
	}, 60000)
}

const expireBlacklist = async (client, db) => {
	setInterval(async () => {
		let data = await db.find()

		if (data.length > 0) {
			const now = Math.floor(Date.now() / 1000)
			let array = data

			// eslint-disable-next-line no-inner-declarations
			function isExpirationTime(item) {
				if (item.expire === 0) return false
				if (item.expire - now <= 50) return true
				else return false
			}

			array = array.filter(isExpirationTime)

			for (const i in array) {
				try {
					data = array[i]

					const expire = data.expire
					const timeRemaining = (expire - now) * 1000

					const guild = data.ServerID
						? await client.guilds.cache.get(data.ServerID)
						: undefined
					const user = data.UserID
						? await client.users.fetch(data.UserID)
						: undefined

					if (guild) {
						setTimeout(async () => {
							await db.deleteOne({ ServerID: guild.id })
							console.log(
								'Se desactivó la blacklist del servidor',
								guild.name,
							)
							client.channels.cache.get('979532885235220500').send({
								embeds: [
									new MessageEmbed()
										.setTitle('BLACKLIST FINALIZADO')
										.setDescription(
											'Se ha terminado la blacklist de un servidor',
										)
										.addField('Servidor:', guild.name, true)
										.addField('ID:', guild.id, true)
										.addField('ID Owner:', guild.ownerId, true)
										.setColor('RED'),
								],
							})
						}, timeRemaining)
					} else if (user) {
						setTimeout(async () => {
							await db.deleteOne({ UserID: user.id })
							console.log('Se desactivó la blacklist para', user.tag)
							client.channels.cache.get('979532885235220500').send({
								embeds: [
									new MessageEmbed()
										.setTitle('BLACKLIST FINALIZADO')
										.setDescription(
											'Se ha terminado la blacklist de un usuario',
										)
										.addField('Usuario:', user.tag, true)
										.addField('ID:', user.id, true)
										.setColor('RED'),
								],
							})
						}, timeRemaining)
					}
				} catch (e) {
					console.log(e)
				}
			}
		}
	}, 60000)
}
