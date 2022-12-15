/* eslint-disable no-unused-vars */
const { CommandInteraction, Client } = require('discord.js-light')

/**
 * @param {Client} client
 * @param {CommandInteraction | String | Guild} interaction
 * @param {String} keys
 * @return {String[]}
 */

module.exports = (client, interaction, ...keys) => {
	const lang = interaction.locale || interaction.preferredLocale || interaction
	return keys.map((key) => {
		const k = client.language.get(key)
		/*
		if (k?.[lang]) {
			return k[lang].replaceAll('&44', ',')
		} else*/ if (k?.['es-ES']) {
			return k['es-ES'].replaceAll('&44', ',')
		} else {
			console.log('No se encontró la key', key)
			return key
		}
	})
}
