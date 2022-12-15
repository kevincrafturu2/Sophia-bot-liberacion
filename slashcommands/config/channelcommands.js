const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const schema = require('../../models/limitusecommands')
/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['MANAGE_GUILD'],
	botPerms: ['MANAGE_GUILD'],
	category: 'Configuración',

	data: new SlashCommandBuilder()
		.setName('channelcommands')
		.setDescription(
			'Establece o quita el canal de uso de comandos de Sophia del servidor.',
		)
		.addSubcommand((o) =>
			o
				.setName('enable')
				.setDescription('Activa el sistema')
				// eslint-disable-next-line no-shadow
				.addChannelOption((o) =>
					o
						.setName('canal')
						.setDescription('Canal de comandos')
						.setRequired(true),
				),
		)
		.addSubcommand((o) =>
			o.setName('disable').setDescription('Desactiva el sistema.'),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(_, interaction) {
		const args = interaction.options
		const subcmd = args.getSubcommand()

		if (subcmd === 'enable') {
			const chid = args.getChannel('canal')
			if (chid.type !== 'GUILD_TEXT' || !chid.viewable) {
				const noValid = new MessageEmbed()
					.setTitle('❌ Error')
					.setDescription('¡Ese no es un canal valido!')
					.setColor('RED')

				return await interaction.reply({ embeds: [noValid], ephemeral: true })
			}

			const sameID = new MessageEmbed()
				.setTitle('❌ Error')
				.setColor('RED')
				.setDescription(
					'El canal establecido tiene el mismo ID de antes, establece otro!',
				)

			const successUpdate = new MessageEmbed()
				.setTitle('✅ Exito')
				.setColor('GREEN')
				.setDescription(
					`El canal de uso de comandos fue actualizado a <#${chid.id}>`,
				)

			const success = new MessageEmbed()
				.setTitle('✅ Exito')
				.setColor('GREEN')
				.setDescription(
					`El canal de uso de comandos fue establecido a <#${chid.id}>`,
				)

			const channel = await schema.findOne({ ServerID: interaction.guild.id })

			if (!channel) {
				const ch = new schema({
					ServerID: interaction.guild.id,
					ChannelID: chid.id,
				})
				await ch.save()
				return await interaction.reply({ embeds: [success] })
			} else if (channel && channel.ChannelID !== chid.id) {
				await schema.updateOne(
					{ ServerID: interaction.guild.id },
					{ $set: { ChannelID: chid.id } },
				)
				return await interaction.reply({ embeds: [successUpdate] })
			}

			if (channel && channel.ChannelID === chid.id)
				return await interaction.reply({ embeds: [sameID], ephemeral: true })
		}

		if (subcmd === 'disable') {
			await schema.deleteOne({ ServerID: interaction.guild.id })

			const embed = new MessageEmbed()
				.setTitle('Okay! ♦')
				.setDescription('He desactivado el sistema!')
				.setColor('GREEN')

			interaction.reply({ embeds: [embed] })
		}
	},
}

module.exports = command
