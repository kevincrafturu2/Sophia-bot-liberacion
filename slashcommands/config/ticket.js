const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js-light')
const schema = require('../../models/tickets.js')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['MANAGE_GUILD', 'MANAGE_CHANNELS'],
	botPerms: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'MANAGE_GUILD'],
	category: 'Configuración',

	data: new SlashCommandBuilder()
		.setName('ticket')
		.setDescription('Establece y modifica los tickets')
		.addSubcommandGroup(
			(o) =>
				o
					.setName('set')
					.setDescription('Establece las opciones de los tickets')
					.addSubcommand((r) =>
						r
							.setName('rol')
							.setDescription(
								'Establece el rol que puede ver los tickets para administrarlos',
							)
							.addRoleOption((ro) =>
								ro
									.setName('value')
									.setDescription('El rol')
									.setRequired(true),
							),
					)
					.addSubcommand(
						(
							e, // embed option
						) =>
							e
								.setName('embed')
								.setDescription('Crea el embed que se enviará')
								.addStringOption((d) =>
									d
										.setName('descripción')
										.setDescription('Descripción del embed')
										.setRequired(true),
								)
								.addStringOption((t) =>
									t
										.setName('titulo')
										.setDescription('Titulo del embed')
										.setRequired(false),
								)
								.addStringOption((c) =>
									c
										.setName('color')
										.setDescription('Color del embed')
										.setRequired(false),
								)
								.addStringOption((f) =>
									f
										.setName('footer')
										.setDescription('Footer del embed')
										.setRequired(false),
								),
					) // end embed option

					.addSubcommand(
						(
							b, // boton option
						) =>
							b
								.setName('botón')
								.setDescription(
									'Crea el botón que se adjuntará al embed para crear el ticket',
								)
								.addStringOption((te) =>
									te
										.setName('texto')
										.setDescription('Texto del botón')
										.setRequired(true),
								)
								.addStringOption((i) =>
									i
										.setName('icono')
										.setDescription('Icono del botón')
										.setRequired(false),
								),
					), // end boton option
		) // end set
		.addSubcommand(
			(
				s, // send option
			) =>
				s
					.setName('send')
					.setDescription('Envía el mensaje')
					.addChannelOption((can) =>
						can
							.setName('canal')
							.setDescription('Canal al que se enviará el mensaje')
							.setRequired(true),
					),
		)
		.addSubcommand(
			(
				v, // preview option
			) =>
				v
					.setName('preview')
					.setDescription(
						'Muestra una vista previa del mensaje que se enviará',
					),
		)
		.addSubcommand((h) =>
			h.setName('help').setDescription('Muestra como se hacen los tickets.'),
		)
		.addSubcommand((re) =>
			re
				.setName('remove')
				.setDescription('Elimina un panel de los tickets.')
				.addStringOption((n) =>
					n
						.setName('id')
						.setDescription(
							'id que aparece en el footer de un panel de ticket.',
						)
						.setRequired(true),
				),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		function randomId(length = 4, letters = false) {
			let result = ''
			const characters =
				letters === true
					? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
					: '0123456789'
			for (let i = 0; i < length; i++)
				result += characters.charAt(Math.floor(Math.random() * characters.length))

			return result
		}
		try {
			const options = interaction.options
			const embed = new MessageEmbed()
			const row = new MessageActionRow()
			const button = new MessageButton()
			const results = await schema.findOne({ ServerID: interaction.guild.id })

			const uid =
				results &&
				results.Panels.find((p) => p.ended === false) &&
				results.Panels.find((p) => p.ended === false).uid
					? results.Panels.find((p) => p.ended === false).uid
					: randomId(4, true)

			if (options.getSubcommand() === 'embed') {
				const title = options.getString('titulo')
				const description = options.getString('descripción')
				const color = options.getString('color')
				const footer = options.getString('footer')
				embed.setDescription(description)
				title ? embed.setTitle(title) : null
				color ? embed.setColor(color) : embed.setColor('#0099ff')
				footer
					? embed.setFooter({ text: footer + ' | id: ' + uid })
					: embed.setFooter({ text: 'id: ' + uid })
				const panel = {
					Message: {
						embed,
					},
					id: randomId(13),
					uid,
					ended: false,
				}

				if (results && results.Panels.find((p) => p.ended === false)) {
					await schema.updateOne(
						{
							ServerID: interaction.guild.id,
							'Panels.ended': false,
						},
						{
							$set: {
								'Panels.$.Message.embed': embed,
							},
						},
					)

					if (
						results &&
						results.Panels.find((p) => p.ended === false).Message.button
					) {
						return await interaction.reply({
							content: '✅ Embed creado! preview:',
							embeds: [embed],
							components: [
								results.Panels.find((p) => p.ended === false).Message
									.button,
							],
							ephemeral: true,
						})
					}

					return await interaction.reply({
						content: '✅ embed Creado! preview:',
						embeds: [embed],
						ephemeral: true,
					})
				}

				if (results && !results.Panels.find((p) => p.ended === false)) {
					await schema.updateOne(
						{
							ServerID: interaction.guild.id,
						},
						{
							$push: {
								Panels: panel,
							},
						},
					)
					if (
						results &&
						results.Panels.find((p) => p.ended === false) &&
						results.Panels.find((p) => p.ended === false).Message &&
						results.Panels.find((p) => p.ended === false).Message.button
					) {
						return await interaction.reply({
							content: '✅ Embed creado! preview:',
							embeds: [embed],
							components: [
								results.Panels.find((p) => p.ended === false).Message
									.button,
							],
							ephemeral: true,
						})
					}

					return await interaction.reply({
						content: '✅ embed Creado! preview:',
						embeds: [embed],
						ephemeral: true,
					})
				}

				if (!results) {
					const newTicket = new schema({
						ServerID: interaction.guild.id,
						ChannelID: undefined,
						Panels: [panel],
					})
					await newTicket.save()
					return await interaction.reply({
						content: '✅ Embed Creado! preview:',
						embeds: [embed],
						ephemeral: true,
					})
				}
			}

			if (options.getSubcommand() === 'botón') {
				const text = options.getString('texto')
				const icon = options.getString('icono')
				button.setLabel(text)
				button.setCustomId(randomId(13))
				button.setStyle('PRIMARY')
				icon ? button.setEmoji(icon) : null
				row.addComponents(button)

				if (results && results.Panels.find((p) => p.ended === false)) {
					await schema.updateOne(
						{
							ServerID: interaction.guild.id,
							'Panels.ended': false,
						},
						{
							$set: {
								'Panels.$.Message.button': row,
							},
						},
					)
				}

				if (!results) {
					const newTicket = new schema({
						ServerID: interaction.guild.id,
						ChannelID: undefined,
						Panels: [
							{
								Message: {
									button: row,
								},
								id: randomId(13),
								uid,
								ended: false,
							},
						],
					})
					await newTicket.save()
				}

				if (
					results &&
					results.Panels.find((p) => p.ended === false).Message.embed
				) {
					return await interaction.reply({
						content: '✅ Botón creado! preview:',
						embeds: [
							results.Panels.find((p) => p.ended === false).Message.embed,
						],
						components: [row],
						ephemeral: true,
					})
				}

				return await interaction.reply({
					content: '✅ Botón Creado! preview:',
					components: [row],
					ephemeral: true,
				})
			}
			if (options.getSubcommand() === 'rol') {
				const role = options.getRole('value')
				if (!role.editable) {
					return await interaction.reply({
						embeds: [
							new MessageEmbed()
								.setTitle(':x: Error')
								.setDescription('No puedo manejar ese rol!')
								.setColor('#ff0000'),
						],
						ephemeral: true,
					})
				}
				if (results && results.Panels.find((p) => p.ended === false)) {
					await schema.updateOne(
						{
							ServerID: interaction.guild.id,
							'Panels.ended': false,
						},
						{
							$set: {
								'Panels.$.Message.RoleID': role.id,
							},
						},
					)
					return await interaction.reply({
						content: '✅ Rol Establecido!',
						ephemeral: true,
					})
				}

				if (!results) {
					const newTicket = new schema({
						ServerID: interaction.guild.id,
						ChannelID: undefined,
						Panels: [
							{
								Message: {
									RoleID: role,
								},
								id: randomId(13),
								uid,
								ended: false,
							},
						],
					})
					await newTicket.save()
				}
				return await interaction.reply({
					content: '✅ Rol Establecido!',
					ephemeral: true,
				})
			}

			// }

			if (options.getSubcommand() === 'preview') {
				if (results) {
					const resultz = results.Panels.find((p) => p.ended === false)
					if (resultz && resultz.Message.embed && resultz.Message.button) {
						return await interaction.reply({
							embeds: [resultz.Message.embed],
							components: [resultz.Message.button],
							ephemeral: true,
						})
					}

					if (resultz && resultz.Message.embed && !resultz.Message.button) {
						return await interaction.reply({
							embeds: [resultz.Message.embed],
							ephemeral: true,
						})
					}

					if (resultz && resultz.Message.button && !resultz.Message.embed) {
						return await interaction.reply({
							content: 'Preview del botón:',
							components: [resultz.Message.button],
							ephemeral: true,
						})
					}

					if (resultz && !resultz.Message.button && !resultz.Message.embed) {
						return await interaction.reply({
							content: 'No hay nada que mostrar!',
							ephemeral: true,
						})
					}

					if (!resultz) {
						return await interaction.reply({
							content: 'No hay nada que mostrar!',
							ephemeral: true,
						})
					}
				}
			}

			if (options.getSubcommand() === 'send') {
				if (
					results &&
					results.Panels.find((p) => p.ended === false) &&
					results.Panels.find((p) => p.ended === false).Message.embed &&
					results.Panels.find((p) => p.ended === false).Message.button &&
					results.Panels.find((p) => p.ended === false).Message.RoleID
				) {
					const channel = options.getChannel('canal')
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
					const msg = await channel.send({
						embeds: [
							results.Panels.find((p) => p.ended === false).Message.embed,
						],
						components: [
							results.Panels.find((p) => p.ended === false).Message.button,
						],
					})

					await schema
						.updateOne(
							{
								ServerID: interaction.guild.id,
								'Panels.ended': false,
							},
							{
								$set: {
									'Panels.$.ended': true,
									'Panels.$.id': msg.id,
								},
								ChannelID: channel.id,
							},
						)
						.then(
							async () =>
								await interaction.reply({
									content: '✅ Panel del ticket enviado!',
									ephemeral: true,
								}),
						)
				} else {
					return await interaction.reply({
						embeds: [
							new MessageEmbed()
								.setTitle(':x: Error')
								.setDescription('No hay ningún panel terminado!')
								.setColor('RED'),
						],
						ephemeral: true,
					})
				}
			}

			if (options.getSubcommand() === 'remove') {
				const Uid = options.getString('id')
				schema.findOne(
					{ ServerID: interaction.guild.id },
					// eslint-disable-next-line no-shadow
					async (err, results) => {
						if (err) throw new Error(err)
						if (results) {
							const panel = results.Panels.find((p) => p.uid === Uid)
							if (panel) {
								interaction.guild.channels.cache
									.filter(
										(c) =>
											c.type === 'GUILD_TEXT' &&
											c.messages.cache.get(panel.id),
									)
									.forEach(async (c) => {
										await c.messages
											.fetch(panel.id)
											.then(async (m) => {
												m ? await m.delete() : null
											})
									})
								if (results.Panels.length <= 1) {
									await schema
										.deleteOne({ ServerID: interaction.guild.id })
										.then(
											async () =>
												await interaction.reply({
													embeds: [
														new MessageEmbed()
															.setTitle(
																'✅ panel eliminado!',
															)
															.setDescription(
																'El panel fue eliminado exitosamente.',
															)
															.setColor('AQUA'),
													],
													ephemeral: true,
												}),
										)
								} else {
									const index = results.Panels.indexOf(panel)
									results.Panels.splice(index, 1)
									results.save()
								}
							} else {
								return await interaction.reply({
									embeds: [
										new MessageEmbed()
											.setTitle(':x: Error')
											.setDescription(
												'No se encontró ningún panel con esa id!',
											)
											.setColor('RED'),
									],
									ephemeral: true,
								})
							}
						} else {
							await interaction.reply({
								embeds: [
									new MessageEmbed()
										.setTitle(':x: Error')
										.setDescription('No hay ningún panel creado!')
										.setColor('RED'),
								],
								ephemeral: true,
							})
						}
					},
				)
				/* interaction.reply({embeds: [
            new MessageEmbed()
                .setTitle("⚠ Comando en Mantenimiento")
                .setColor("YELLOW")
                ], ephemeral: true})*/
			}

			if (options.getSubcommand() === 'help') {
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle(
								'Cómo crear un sistema de tickets para mi servidor?',
							)
							.setDescription(
								'Para crear un sistema de tickets en tu servidor, debes usar el comando `/ticket` seguido de unas opciones.\n\n> /ticket set embed\n> /ticket set botón\n> /ticket set rol\n> /ticket preview\n> /ticket send\n> /ticket remove\n\nUn ejemplo de cómo se crearía un panel de un ticket sería:',
							)
							.setImage(
								'https://cdn.discordapp.com/attachments/900227991181877268/967955572391567360/unknown.png',
							)
							.setColor('AQUA'),
						new MessageEmbed()
							.setDescription(
								'Lo que dará como resultado una interfáz de usuario similar a la siguiente:',
							)
							.setColor('AQUA')
							.setImage(
								'https://cdn.discordapp.com/attachments/900227991181877268/967957561141755904/unknown.png',
							),
						new MessageEmbed()
							.setDescription(
								'Después de eso para añadirle un botón se debe usar el comando:',
							)
							.setImage(
								'https://cdn.discordapp.com/attachments/900227991181877268/967957921889677362/unknown.png',
							)
							.setColor('AQUA'),
						new MessageEmbed()
							.setDescription(
								'Y por ultimo pero de lo más importante, debes añadir el rol de los administradores para que puedan gestionar el ticket para que solucionen esos problemas.',
							)
							.setImage(
								'https://cdn.discordapp.com/attachments/900227991181877268/967958331413106758/unknown.png',
							)
							.setColor('AQUA'),
						new MessageEmbed()
							.setDescription(
								'Finalmente para terminar y enviar el ticket y poder crear otros, se debe usar:',
							)
							.setImage(
								'https://cdn.discordapp.com/attachments/900227991181877268/967958774721679370/unknown.png',
							)
							.setColor('AQUA'),
						new MessageEmbed()
							.setDescription('Después de todo, el resultado sería este:')
							.setImage(
								'https://cdn.discordapp.com/attachments/900227991181877268/967961417644924998/unknown.png',
							)
							.setColor('AQUA'),
						new MessageEmbed()
							.setDescription('*(Al abrir un ticket)*')
							.setImage(
								'https://cdn.discordapp.com/attachments/900227991181877268/967961757077340280/unknown.png?size=4096',
							)
							.setColor('AQUA'),
						new MessageEmbed()
							.setDescription(
								'Con eso finaliza la parte de creación, para la eliminación de los tickets se usa una id unica que se crea automaticamente, esta en el footer de esta forma: `id: aSbC (id de ejemplo)`, para borrar un panel se usa:',
							)
							.setImage(
								'https://cdn.discordapp.com/attachments/900227991181877268/967959960841519144/unknown.png',
							)
							.setColor('AQUA'),
					],
					ephemeral: true,
				})
			}
		} catch (err) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(':x: Error')
						.setDescription(
							'Haz puesto algo mal! para hacerlo correctamente revisa el tutorial: `/ticket help`',
						)
						.setColor('RED'),
				],
				ephemeral: true,
			})
		}
	},
}

module.exports = command