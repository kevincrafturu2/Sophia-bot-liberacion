const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js-light')
const schema = require('../../models/autorole.js')
/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['MANAGE_GUILD', 'MANAGE_ROLES'],
	botPerms: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
	category: 'Configuración',

	data: new SlashCommandBuilder()
		.setName('autorole')
		.setDescription('Establece el canal para usar los autoroles (BETA)')
		.addSubcommand((s) =>
			s
				.setName('set')
				.setDescription('Establece los datos para el autorole')
				.addStringOption((o) =>
					o
						.setName('titulo')
						.setDescription('Qué titulo llevará el embed?')
						.setRequired(true),
				)
				.addStringOption((o) =>
					o
						.setName('descripcion')
						.setDescription('Qué descripción llevará el embed?')
						.setRequired(true),
				)
				.addChannelOption((o) =>
					o
						.setName('channel')
						.setDescription('El canal donde se creará el autorole')
						.setRequired(true),
				)
				.addStringOption((o) =>
					o
						.setName('roles')
						.setDescription('tabla con la información de los roles')
						.setRequired(true),
				),
		)
		.addSubcommand((s) =>
			s.setName('help').setDescription('Muestra como setear los auto roles'),
		),

	/**
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(_, interaction) {
		const args = interaction.options
		const subcmd = args.getSubcommand()
		if (subcmd === 'set') {
			const componentsArr = new Array()
			try {
				const channel = args.getChannel('channel')
				if (channel.type !== 'GUILD_TEXT' || !channel.viewable) {
					return await interaction.reply({
						embeds: [
							new MessageEmbed()
								.setTitle('❌ Error')
								.setDescription('¡Ese no es un canal valido!')
								.setColor('RED'),
						],
						ephemeral: true,
					})
				}

				const roles = args.getString('roles')

				let rolesObj = JSON.parse(roles)
				rolesObj = rolesObj.map((r) => {
					return {
						nombreBoton: r.nombreBoton,
						rol: r.rol.trim().replace(/<@&/g, '').replace(/>/g, ''),
					}
				})

				const validateArrayData = rolesObj.every(
					(obj) =>
						typeof obj.rol === 'string' &&
						typeof obj.nombreBoton === 'string',
				)
				const validateRoleEditable = rolesObj.every(
					(obj) => interaction.guild.roles.cache.get(obj.rol).editable === true,
				)
				if (!validateArrayData) {
					return await interaction.reply({
						embeds: [
							new MessageEmbed()
								.setTitle(':x: Error')
								.setDescription(
									'El formato de los datos no es correcto\nRevisa `/setautorole help` para saber cómo hacerlo',
								)
								.setColor('RED'),
						],
						ephemeral: true,
					})
				}
				if (!validateRoleEditable) {
					return await interaction.reply({
						embeds: [
							new MessageEmbed()
								.setTitle(':x: Error')
								.setDescription(
									'Alguno de los roles que agregaste no puedo manejarlo, por lo tanto no podre agregarlo.',
								)
								.setColor('RED'),
						],
						ephemeral: true,
					})
				}

				rolesObj.forEach((obj) => {
					componentsArr.push(
						new MessageButton()
							.setLabel(obj.nombreBoton)
							.setCustomId(obj.rol)
							.setStyle('SECONDARY'),
					)
				})

				const repeatedIds = componentsArr
					.map((obj) => obj.customId)
					.filter((value, index, self) => self.indexOf(value) !== index)
				if (repeatedIds.length > 0) {
					return await interaction.reply({
						embeds: [
							new MessageEmbed()
								.setTitle(':x: Error')
								.setDescription('Los roles no pueden repetirse')
								.setColor('RED'),
						],
					})
				}

				const components = new MessageActionRow().addComponents(...componentsArr)

				const embed = new MessageEmbed()
					.setTitle(args.getString('titulo'))
					.setDescription(args.getString('descripcion'))
					.setColor('GREEN')

				// save data
				const results = await schema.findOne({ guildId: interaction.guild.id })
				if (results) {
					await schema.updateOne(
						{ guildId: interaction.guild.id },
						{
							guildId: interaction.guild.id,
							channelId: channel.id,
							roles: rolesObj,
						},
					)
				} else {
					new schema({
						guildId: interaction.guild.id,
						channelId: channel.id,
						roles: rolesObj,
					}).save()
				}

				await interaction.guild.channels.cache
					.get(channel.id)
					.send({ embeds: [embed], components: [components] })

				await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle('¡Listo!')
							.setDescription('El autorol se ha establecido correctamente')
							.setColor('GREEN'),
					],
					ephemeral: true,
				})
			} catch (er) {
				console.log(er)
				await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle(':x: Error')
							.setDescription(
								'No se puedo transformar correctamente el JSON\nRevisa el comando `/setautorole help` para saber cómo hacerlo',
							)
							.setColor('RED'),
					],
					ephemeral: true,
				})
			}
		}

		if (subcmd === 'help') {
			const embed = new MessageEmbed()
				.setTitle('¿Cómo setear los autoroles?')
				.setDescription(
					'Para setear los autoroles, debes ejecutar el comando `/autorole set` en el valor channel poner el canal donde se enviarán los autoroles y en el valor roles deberas poner un JSON con la información.\n\nEjemplo:\n```json\n[{\n    "nombreBoton": "Texto que mostrara el boton",\n    "rol": "@rol"\n},\n{\n    "nombreBoton": "Texto que mostrara el boton",\n    "rol": "@rol"\n}]```\n\nEl rol no puede repetirse\n**RESPETAR CADA SIGNO PARA QUE FUNCIONE BIEN**\n\nejemplo del comando entero:',
				)
				.setImage(
					'https://cdn.discordapp.com/attachments/894970556632403979/962770758784909312/unknown.png',
				)
				.setColor('GREEN')
				.setFooter({
					text: 'Disfruta del bot!, Recuerda que solo puedes establecer un canal de autoroles.',
					iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
				})
				.setTimestamp()
			await interaction.reply({ embeds: [embed], ephemeral: true })
		}
	},
}

module.exports = command
