/* eslint-disable no-undef */
const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const antilinksModel = require('../../models/antilinks')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['MANAGE_GUILD'],
	botPerms: ['MANAGE_GUILD'],
	category: 'Configuración',

	data: new SlashCommandBuilder()
		.setName('setantilinks')
		.setDescription('Enciende o apaga el antilinks.')
		.addSubcommand((o) =>
			o.setName('activalo').setDescription('Activa el sistema anti links'),
		)
		.addSubcommand((o) =>
			o.setName('desactivalo').setDescription('Desactiva el anti links'),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const subcmd = interaction.options.getSubcommand()

		if (subcmd === 'activalo') {
			const anti = await antilinksModel.findOne({ ServerID: interaction.guild.id })

			spamEmoji = '🚫'
			checked = '<a:Stable:910938393968517180>'
			unchecked = '<a:Down:910938393993699350>'

			if (!anti) {
				const final = new MessageEmbed()
					.setTitle('✅ Exito')
					.setColor('GREEN')
					.setDescription(
						`El Anti-Links ahora está: \n ${checked} **Activado**`,
					)

				const aM = new antilinksModel({
					ServerID: interaction.guildId,
				})

				await aM.save()

				interaction.reply({ embeds: [final] }).then(() => {
					setTimeout(() => {
						interaction.deleteReply()
					}, 5000)
				})
			} else {
				const ya = new MessageEmbed()
					.setTitle('✅ Exito')
					.setColor('GREEN')
					.setDescription(
						`El Anti-Links **ya** está: \n ${checked} **Activado**`,
					)

				interaction.reply({ embeds: [ya], ephemeral: true })
			}
		}

		if (subcmd === 'desactivalo') {
			const anti = await antilinksModel.findOne({ ServerID: interaction.guild.id })

			spamEmoji = '🚫'
			checked = '<a:Stable:910938393968517180>'
			unchecked = '<a:Down:910938393993699350>'

			if (!anti) {
				const final = new MessageEmbed()
					.setTitle(':x: Error')
					.setColor('RED')
					.setDescription(
						`El Anti-Links **no** se encuentra: \n ${unchecked} **Activado**`,
					)

				interaction.reply({ embeds: [final], ephemeral: true })
			} else {
				const ya = new MessageEmbed()
					.setTitle('✅ Exito')
					.setColor('GREEN')
					.setDescription(
						`El Anti-Links ahora está: \n ${unchecked} **Desactivado**`,
					)

				await antilinksModel.findOneAndDelete({ ServerID: interaction.guild.id })

				interaction.reply({ embeds: [ya] }).then(() => {
					setTimeout(() => {
						interaction.deleteReply()
					}, 5000)
				})
			}
		}
	},
}

module.exports = command
