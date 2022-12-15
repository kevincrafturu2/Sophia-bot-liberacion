/* eslint-disable no-undef */
const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const antispamModel = require('../../models/antispam')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['MANAGE_GUILD'],
	botPerms: ['MANAGE_GUIL'],
	category: 'Configuración',

	data: new SlashCommandBuilder()
		.setName('setantispam')
		.setDescription('Activa o desactiva el antispam')
		.addSubcommand((o) =>
			o.setName('activalo').setDescription('Activa el sistema anti spam'),
		)
		.addSubcommand((o) =>
			o.setName('desactivalo').setDescription('Desactiva el anti spam'),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const subcmd = interaction.options.getSubcommand()

		if (subcmd === 'activalo') {
			const anti = await antispamModel.findOne({ ServerID: interaction.guild.id })

			spamEmoji = '🚫'
			checked = '<a:Stable:910938393968517180>'
			unchecked = '<a:Down:910938393993699350>'

			if (!anti) {
				const final = new MessageEmbed()
					.setTitle('✅ Exito')
					.setColor('GREEN')
					.setDescription(`El Anti-Spam ahora está: \n ${checked} **Activado**`)

				const aM = new antispamModel({
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
						`El Anti-Spam **ya** está: \n ${checked} **Activado**`,
					)

				interaction.reply({ embeds: [ya], ephemeral: true })
			}
		}

		if (subcmd === 'desactivalo') {
			const anti = await antispamModel.findOne({ ServerID: interaction.guild.id })

			spamEmoji = '🚫'
			checked = '<a:Stable:910938393968517180>'
			unchecked = '<a:Down:910938393993699350>'

			if (!anti) {
				const final = new MessageEmbed()
					.setTitle(':x: Error')
					.setColor('RED')
					.setDescription(
						`El Anti-Spam **no** se encuentra: \n ${unchecked} **Activado**`,
					)

				interaction.reply({ embeds: [final], ephemeral: true })
			} else {
				const ya = new MessageEmbed()
					.setTitle('✅ Exito')
					.setColor('GREEN')
					.setDescription(
						`El Anti-Spam ahora está: \n ${unchecked} **Desactivado**`,
					)

				await antispamModel.findOneAndDelete({ ServerID: interaction.guild.id })

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
