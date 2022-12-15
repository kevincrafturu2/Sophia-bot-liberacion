const { SlashCommandBuilder } = require('@discordjs/builders')
const db = require('../../models/yt-system')
const { MessageEmbed } = require('discord.js-light')

/**
* @type {import('../../types/typeslash').Command}
*/

const command = {
	userPerms: ['MANAGE_GUILD'],
	botPerms: ['MANAGE_GUILD'],
	category: 'Configuración',


	data: new SlashCommandBuilder()
		.setName('yt-notification')
		.setDescription('Administra notificaciones de videos de YouTube!')
		.addSubcommand(as =>
			as
				.setName('help')
				.setDescription('Aprende en sencillos pasos como setear un canal de YouTube.'),
		)
		.addSubcommand(oC =>
			oC
				.setName('set')
				.setDescription('Establece una notificación para un video de YouTube')
				.addStringOption(o =>
					o.setName('ytchannelid')
						.setDescription('Define la ID del canal de YT')
						.setRequired(true),
				)
				.addChannelOption(p =>
					p.setName('notificationchannel')
						.setDescription('Canal donde se enviará las notificaciones.')
						.setRequired(true),
				)
				.addStringOption(o =>
					o.setName('everyone')
						.setDescription('Define si menciona o no a everyone el bot')
						.setRequired(true)
						.addChoices(
							{ name: 'si', value: 'true' },
							{ name: 'no', value: 'false' },
						),
				),
		)
		.addSubcommand(oC =>
			oC
				.setName('remove')
				.setDescription('Elimina una notificación para un video de YouTube'),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const subcmd = interaction.options.getSubcommand()

		if (subcmd === 'help') {
			const embed = new MessageEmbed()
				.setTitle('<a:YTSophia:997041899602976808> Seteo de Notificaciones de YouTube. <a:YTSophia:997041899602976808>')
				.setDescription(
					'Bienvenido al mini instructivo de como setear tu canal.\n' +
					'a continuación deberás dirigirte hacia tu [studio de Youtube](https://studio.youtube.com/), una vez dentro, deberás poner atención a la URL, te saldrá algo asi:\n\n' +
					'https://studio.youtube.com/channel/UCTs9HBqF0l4xHWSKi47gxBg\n\n' +
					'En este caso, el URL es de mi canal, para poder setear en canal te pide una ID, en mi caso la ID es: `UCTs9HBqF0l4xHWSKi47gxBg` por ende en la opción `ytchannelid` ponemos la ID que nos de la URL, rellenas los demás parámetros y listo, a disfrutar!',
				)
				.setColor('RED')

			interaction.reply({ embeds: [embed], ephemeral: true })
		}

		if (subcmd === 'set') {

			const ChannelYTID = interaction.options.getString('ytchannelid')
			const channel = interaction.options.getChannel('notificationchannel')
			const { id: ChannelID } = channel
			const error = new MessageEmbed().setColor('RED').setTitle(':x: Error')

			if (!channel.type === 'GUILD_TEXT') return interaction.reply({ embeds: [error.setDescription('El canal especificado no es de texto o es una categoría, ingresa uno nuevo.')], ephemeral: true })

			const data = await db.findOne({ ServerID: interaction.guildId })

			if (!data) {
				const newdb = new db({
					ServerID: interaction.guildId,
					ChannelYTID,
					ChannelID,
					everyone: interaction.options.getString('everyone') === 'true' ? true : false,
				})
				await newdb.save()

				const ok = new MessageEmbed()
					.setTitle('❤ Listo!')
					.setDescription(`He establecido el canal de YouTube con la id: \`${ChannelYTID}\` \nEl canal de notificaciones será: ${channel}`)
					.setColor('GREEN')

				interaction.reply({ embeds: [ok] })
			} else {
				return interaction.reply({ embeds: [error.setDescription('Ya hay un canal seteado.')], ephemeral: true })
			}
		}

		if (subcmd === 'remove') {
			const okay = new MessageEmbed()
				.setTitle('👌 Vale')
				.setDescription('He eliminado los datos almacenados, ya puedes setear uno nuevo.')
				.setColor('GREEN')


			const error = new MessageEmbed().setTitle(':x: Error').setColor('RED')
			const data = await db.findOne({ ServerID: interaction.guildId })

			if (!data) return interaction.reply({ embeds: [error.setDescription('No existe información en mi base de datos.')], ephemeral: true })

			await db.findOneAndDelete({
				ServerID: interaction.guildId,
			})

			interaction.reply({ embeds: [okay] }) // no son necesarioos

		}
	},
}

module.exports = command