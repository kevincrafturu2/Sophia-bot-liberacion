const { SlashCommandSubcommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const add = require('../../../helpers/add-money.js')
const { CommandCooldown, msToMinutes } = require('discord-command-cooldown')
const a = new CommandCooldown('daily', 86400000) // 86400000 = 24h

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['SEND_MESSAGES'],
	botPerms: ['SEND_MESSAGES'],
	category: 'Economía',

	data: new SlashCommandSubcommandBuilder()
		.setName('daily')
		.setDescription('Obtén dinero gratis diariamente!'),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const userCooldowned = await a.getUser(interaction.member.id)
		if (userCooldowned) {
			const timeLeft = msToMinutes(userCooldowned.msLeft)
			const error = new MessageEmbed()
				.setTitle(':x: Oh noooo!!!')
				.setDescription('Ya usaste el comando!, debes esperar:')
				.setColor('RED')

			if (timeLeft.hours >= 1)
				error.addField('Tiempo restante:', `${timeLeft.hours} horas`, true)

			if (timeLeft.hours == 0) {
				error.addField(
					'Tiempo restante:',
					`${timeLeft.minutes} minutos, ${timeLeft.seconds} segundos.`,
					true,
				)
			}
			interaction.reply({ embeds: [error] })
		} else {
			add(interaction.guild.id, interaction.user.id, 5000)

			const embed = new MessageEmbed()
				.setTitle('😜 Feliz Dia!')
				.setDescription(
					'Has recibido `5.000$` en efectivo, recuerda guardarlo en el banco!',
				)
				.setColor('GREEN')
				.setThumbnail(interaction.guild.iconURL({ dynamic: true }))

			interaction.reply({ embeds: [embed] })

			await a.addUser(interaction.member.id)
		}
	},
}

module.exports = command
