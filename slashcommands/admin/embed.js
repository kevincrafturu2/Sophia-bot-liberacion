/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageActionRow, MessageButton, CommandInteraction } = require('discord.js-light')
const getLanguage = require('../../functions/getLanguage')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['ADMINISTRATOR'],
	botPerms: ['ADMINISTRATOR'],
	category: 'Administración',

	data: new SlashCommandBuilder()
		.setName('embed')
		.setDescription('Envia un mensaje en embed')
		// .setDescriptionLocalization('en-US', 'Send a embed message')
		.addStringOption((o) =>
			o
				.setName('descripcion')
				.setDescription('Descripción del embed.')
				/* .setNameLocalization('en-US', 'description')
				.setDescriptionLocalization('en-US', 'Description of the embed')*/
				.setRequired(true),
		)
		.addStringOption((o) =>
			o
				.setName('titulo')
				.setDescription('Titulo del embed.')
				.setRequired(false)
				/* .setNameLocalization('en-US', 'title')
				.setDescriptionLocalization('en-US', 'Title of the embed')*/,
		)
		.addStringOption((o) =>
			o
				.setName('footer')
				.setDescription('Footer del embed.')
				.setRequired(false)
				/* .setDescriptionLocalization('en-US', 'Footer of the embed')*/,
		)
		.addStringOption((o) =>
			o
				.setName('imagen')
				.setDescription('Imagen que llevará el embed.')
				/* .setNameLocalization('en-US', 'image')
				.setDescriptionLocalization('en-US', 'Image that will carry the embed') */
				.setRequired(false),
		)
		.addChannelOption((o) =>
			o
				.setName('canal')
				.setDescription('Canal a enviar el embed.')
				/* .setNameLocalization('en-US', 'channel')
				.setDescriptionLocalization('en-US', 'Channel where the embed will be sent')*/
				.setRequired(false),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const args = interaction.options
		const canal = args.getChannel('canal') || interaction.channel
		const language = getLanguage(client, interaction, 'TEXT_CHANNEL_WAS_EXPECTED', 'ENTER_A_VALID_IMAGE_URL', 'LITTLE_QUESTION', 'SEND_EMBED_USING_EVERYONE?', 'WITH_EVERYONE', 'WITHOUT_EVERYONE', 'SENDED', 'YOUR_MESSAGE_SENDED')

		if (canal) {
			if (!['GUILD_TEXT', 'GUILD_NEWS'].includes(canal.type)) {
				return interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle(':x: Error')
							.setDescription(language[0])
							.setColor('RED'),
					],
					ephemeral: true,
				})
			}
		}
		const title = args.getString('titulo') || null
		const description = args.getString('descripcion')
		const footer = args.getString('footer') || null
		const imagen = args.getString('imagen')

		const log = new MessageEmbed()
			.setTitle('Comando Embed usado.')
			.addFields(
				{ name: 'Description:', value: description, inline: true },
				{
					name: 'Autor:',
					value: `${client.users.cache.get(interaction.user.id).tag} (${
						interaction.user.id
					})`,
					inline: true,
				},
				{
					name: 'Servidor:',
					value: `${client.guilds.cache.get(interaction.guild.id).name} (${
						interaction.guild.id
					})`,
				},
			)
			.setImage(imagen || 'https://i.imgur.com/anPh4kJ.jpg')

		const embed = new MessageEmbed()
			.setColor('#00FFFF')
			.setDescription(`${description}`)

		if (title) {
			embed.setTitle(title)
			log.addFields({ name: 'Title:', value: title, inline: true })
		}

		if (footer) {
			embed.setFooter({
				text: footer,
				iconURL: interaction.guild.iconURL({ dynamic: true }),
			})
			log.addFields({ name: 'Footer:', value: footer, inline: true })
		}
		if (imagen) {
			const linkRegex = new RegExp(
				/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g,
			)
			if (!imagen.match(linkRegex)) {
				return interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle(':x: Error')
							.setDescription(language[1])
							.setColor('RED'),
					],
					ephemeral: true,
				})
			}
			embed.setImage(imagen)
		}

		const pregunta = new MessageEmbed()
			.setTitle(`<a:HeartBlack:878324191559032894> ${language[2]}..`)
			.setDescription(language[3])
			.setColor('#00FFFF')

		const row = new MessageActionRow().addComponents(
			new MessageButton()
				.setLabel(language[4])
				.setStyle('DANGER')
				.setCustomId('everyone'),

			new MessageButton()
				.setLabel(language[5])
				.setStyle('PRIMARY')
				.setCustomId('sineveryone'),
		)

		const enviado = new MessageEmbed()
			.setTitle(`<a:TPato_Check:911378912775397436> ${language[6]}`)
			.setDescription(language[7])
			.setColor('GREEN')

		await interaction.reply({
			embeds: [pregunta],
			components: [row],
			ephemeral: true,
		})
		const filtro = (i) => i.user.id === interaction.user.id
		const collector = interaction.channel.createMessageComponentCollector({
			filter: filtro,
			time: 15000,
		})

		collector.on('collect', async (i) => {
			i.deferUpdate()

			if (i.customId === 'everyone') {
				canal.send({ embeds: [embed] })
				canal.send('@everyone').then((msg) => {
					setTimeout(() => {
						msg.delete()
					}, 2000)
				})
				interaction.editReply({
					embeds: [enviado],
					components: [],
					ephemeral: true,
				})
				client.channels.cache.get('990747964337160192').send({ embeds: [log] })
			}
			else if (i.customId === 'sineveryone') {
				canal.send({ embeds: [embed] })
				interaction.editReply({
					embeds: [enviado],
					components: [],
					ephemeral: true,
				})
				client.channels.cache.get('990747964337160192').send({ embeds: [log] })
			}
		})

		collector.on('end', () => {
			interaction.editReply({ embeds: [], components: [] })
		})
	},
}

module.exports = command
