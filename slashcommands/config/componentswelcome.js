/* eslint-disable no-shadow */
const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const schema = require('../../models/components-welcome')
/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['MANAGE_GUILD'],
	botPerms: ['MANAGE_GUILD'],
	category: 'Configuración',

	data: new SlashCommandBuilder()
		.setName('componentswelcome')
		.setDescription(
			'Establece el embed personalizado para el sistema de bienvenidas.',
		)
		.addSubcommand((o) =>
			o
				.setName('set')
				.setDescription('Ingresa los datos.')
				.addStringOption((o) =>
					o
						.setName('descripcion')
						.setDescription('Descripción que llevará el embed.')
						.setRequired(true),
				)
				.addStringOption((o) =>
					o
						.setName('footer')
						.setDescription('Footer que llevará el embed')
						.setRequired(false),
				)
				.addStringOption((o) =>
					o
						.setName('titulo')
						.setDescription('Titulo que llevará el embed.')
						.setRequired(false),
				)
				.addStringOption((o) =>
					o
						.setName('imagen')
						.setDescription('Imagen de fondo que llevará el embed')
						.setRequired(false),
				),
		)
		.addSubcommand((o) =>
			o
				.setName('help')
				.setDescription(
					'Guiate un poco para configurar de forma efectiva el sistema.',
				),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const args = interaction.options
		let title = args.getString('titulo')
		const description = args.getString('descripcion')
		let footer = args.getString('footer')
		let imagen = args.getString('imagen')

		if (!imagen) imagen = interaction.guild.iconURL({ dynamic: false, format: 'png' })

		if (!title) title = ''

		if (!footer) footer = ''

		const subcmd = args.getSubcommand()

		const components = await schema.findOne({ ServerID: interaction.guild.id })

		if (subcmd === 'set') {
			if (!components) {
				const compo = new schema({
					ServerID: interaction.guild.id,
					Description: description,
					Title: title,
					Footer: footer,
					Imagen: imagen,
				})
				compo.save()

				const embed = new MessageEmbed()
					.setTitle('Muy bien! :heart:')
					.setDescription(
						'He analizado los datos y he guardado la información en mi base de datos.',
					)
					.setColor('AQUA')
					.setFooter({ text: 'Dame unos segundos, editaré este mensaje' })

				const final = new MessageEmbed()
					.setTitle(title)
					.setDescription(description)
					.setFooter({ text: footer })
					.setImage(
						`https://api.popcat.xyz/welcomecard?background=${imagen}&text1=${
							interaction.user.username
						}&text2=Bienvenido+a+${
							interaction.guild.name
						}&text3=Pasalo+bien!&avatar=${interaction.user.displayAvatarURL({
							format: 'png',
							dinamyc: false,
						})}`
							.trim()
							.split(/ +/)
							.join('+'),
					)

				interaction.reply({ embeds: [embed] })
				setTimeout(async () => {
					await interaction.editReply({ embeds: [final] })
				}, 5000)
			} else {
				await schema.updateOne({
					ServerID: interaction.guild.id,
					Description: description,
					Title: title,
					Footer: footer,
					Imagen: imagen,
				})

				const embed2 = new MessageEmbed()
					.setTitle('Muy bien! :heart:')
					.setDescription(
						'He analizado los datos y he actualizado la información en mi base de datos.',
					)
					.setColor('AQUA')
					.setFooter({ text: 'Dame unos segundos, editaré este mensaje' })

				const final = new MessageEmbed()
					.setColor('FUCHSIA')
					.setTitle(title)
					.setDescription(description)
					.setFooter({ text: footer })
					.setImage(
						`https://api.popcat.xyz/welcomecard?background=${imagen}&text1=${
							interaction.user.username
						}&text2=Bienvenido+a+${
							interaction.guild.name
						}&text3=Pasalo+bien!&avatar=${interaction.user.displayAvatarURL({
							format: 'png',
							dinamyc: false,
						})}`
							.trim()
							.split(/ +/)
							.join('+'),
					)

				interaction.reply({ embeds: [embed2] })
				setTimeout(async () => {
					await interaction.editReply({ embeds: [final] })
				}, 5000)
			}
		}

		if (subcmd === 'help') {
			const titulo =
				'Al momento de establecer el titulo tienes las siguientes opciones para usar libremente:' +
				'\n' +
				'`{member.username}` - Mostrará el username del usuario, ejemplo, **' +
				interaction.user.username +
				'**' +
				'\n' +
				'`{member.tag}` - Mostrará el tag del usuario, ejemplo, **' +
				interaction.user.tag +
				'**' +
				'\n' +
				'`{server}` - Mostrará el nombre del servidor, ejemplo, **' +
				interaction.guild.name +
				'**'

			const descripcion =
				'Al momento de establecer la descripción tienes las siguientes opciones para usar libremente:' +
				'\n' +
				'`{member.username}` - Mostrará el username del usuario, ejemplo, **' +
				interaction.user.username +
				'**' +
				'\n' +
				'`{member}` - Mostrará una mención del usuario, ejemplo, <@' +
				interaction.user.id +
				'>' +
				'\n' +
				'`{member.tag}` - Mostrará el tag del usuario, ejemplo, **' +
				interaction.user.tag +
				'**' +
				'\n' +
				'`{server}` - Mostrará el nombre del servidor, ejemplo, **' +
				interaction.guild.name +
				'**' +
				'\n' +
				'`{membersTotal}` - Mostrará los miembros totales del servidor, ejemplo, **' +
				interaction.guild.memberCount +
				'**'

			const footer =
				'Al momento de establecer el footer tienes las siguientes opciones para usar libremente:' +
				'\n' +
				'`{member.username}` - Mostrará el username del usuario, ejemplo, **' +
				interaction.user.username +
				'**' +
				'\n' +
				'`{server}` - Mostrará el nombre del servidor, ejemplo, **' +
				interaction.guild.name +
				'**' +
				'\n' +
				'`{membersTotal}` - Mostrará los miembros totales del servidor, ejemplo, **' +
				interaction.guild.memberCount +
				'**'

			const embed = new MessageEmbed()
				.setColor('GREEN')
				.setTitle('Apartado de ayuda para Sistema de bienvenidas.')
				.setDescription(
					'A continuación te daremos una mini guía por el sistema de bienvenidas...',
				)
				.addField('TITULO:', titulo)
				.addField('DESCRIPCIÓN:', descripcion)
				.addField('FOOTER:', footer)

			interaction.reply({ embeds: [embed], ephemeral: true })
			interaction.user.send({ embeds: [embed] }).catch(() => {
				return
			})
		}
	},
}

module.exports = command
