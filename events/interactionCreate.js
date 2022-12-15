const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js-light')
const client = require('../index.js')
const toml = require('toml')
const fs = require('fs')
const config = toml.parse(fs.readFileSync('./config/config.toml', 'utf-8'))

const premiumguild = require('../models/premiumGuild')
const autoroles = require('../models/autorole.js')
const data_deletedate = require('../models/deletedates-sophia.js')
const ticketsSchema = require('../models/tickets.js')

client.on('interactionCreate', async (interaction) => {
	if (interaction.isButton()) {
		await interaction.deferUpdate()
		if (interaction.customId === 'closeTicket') {
			if (!interaction.channel.deletable) {
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle(':x: Error')
							.setDescription(
								'No pude borrar el canal para cerrar el ticket. Puede ser por falta de permisos, avisale a un administrador!',
							)
							.setColor('RED')
							.setFooter({ text: 'Suerte!' }),
					],
					ephemeral: true,
				})
			}
			await interaction.channel.send({
				content: 'El ticket se borrará en 5 segundos.',
			})
			setTimeout(async () => await interaction.channel.delete(), 5000)
		}
		const resultsT = await ticketsSchema.findOne({
			ServerID: interaction.message.guild.id,
		})
		if (resultsT && resultsT.Panels.find((p) => p.id === interaction.message.id)) {
			const r = resultsT.Panels.find((p) => p.id === interaction.message.id)

			interaction.guild.channels
				.create(`ticket-${interaction.member.user.tag}`, {
					type: 'GUILD_TEXT',
					permissionOverwrites: [
						{
							id: interaction.guild.roles.everyone,
							deny: ['VIEW_CHANNEL'],
						},
						{
							id: interaction.member.id,
							allow: ['VIEW_CHANNEL'],
						},
						{
							id: r.Message.RoleID,
							allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS'],
						},
					],
				})
				.then(async (c) => {
					await interaction.followUp({
						embeds: [
							new MessageEmbed()
								.setTitle('Ticket creado')
								.setColor('GREEN'),
						],
						ephemeral: true,
					})
					const btn = new MessageButton()
						.setLabel('Cerrar')
						.setCustomId('closeTicket')
						.setStyle('DANGER')
					const row = new MessageActionRow().addComponents(btn)

					c.send({
						embeds: [
							new MessageEmbed()
								.setTitle(`Ticket de ${interaction.member.user.tag}`)
								.setDescription('Para cerrar el ticket presiona el botón')
								.setColor('GREEN')
								.setFooter({
									text: `Ticket creado por ${interaction.member.user.tag}`,
								}),
						],
						components: [row],
					})
				})
		}
		const results = await autoroles.findOne({ guildId: interaction.guild.id })
		if (
			results &&
			interaction.channel.id === results.channelId &&
			interaction.guild.roles.cache.get(interaction.customId)
		) {
			await interaction.deferUpdate()
			if (interaction.member.roles.cache.has(interaction.customId)) {
				await interaction.member.roles
					.remove(interaction.customId)
					.catch(async () => {
						return await interaction.followUp({
							embeds: [
								new MessageEmbed()
									.setTitle('❌ Error')
									.setDescription(
										'No se te ha podido remover el rol.\nEs posible que me falten permisos, contacta con un administrador para solucionarlo!',
									)
									.setColor('RED'),
							],
							ephemeral: true,
						})
					})
				await interaction.followUp({
					embeds: [
						new MessageEmbed()
							.setTitle('Rol Removido')
							.setDescription(
								`**${interaction.member.user.tag}** se te ha removido el rol <@&${interaction.customId}> correctamente.`,
							)
							.setColor('GREEN'),
					],
					ephemeral: true,
				})
			} else {
				await interaction.member.roles
					.add(interaction.customId)
					.catch(async () => {
						return await interaction.followUp({
							embeds: [
								new MessageEmbed()
									.setTitle('❌ Error')
									.setDescription(
										'No se te ha podido añadir el rol.\nEs posible que me falten permisos, contacta con un administrador para solucionarlo!',
									)
									.setColor('RED'),
							],
							ephemeral: true,
						})
					})
				await interaction.followUp({
					embeds: [
						new MessageEmbed()
							.setTitle('Rol añadido')
							.setDescription(
								`**${interaction.member.user.tag}** se te ha añadido el rol <@&${interaction.customId}> correctamente.`,
							)
							.setColor('GREEN'),
					],
					ephemeral: true,
				})
			}
		}
		if (interaction.customId === 'verificationsystem') {
			// eslint-disable-next-line no-undef
			if (slashcmds.isPremium === true) {
				const espremium = await premiumguild.findOne({
					ServerID: interaction.guildId,
				})
				if (!espremium) {
					return interaction.reply({
						embeds: [
							new MessageEmbed()
								.setTitle(':x: Error')
								.setDescription(
									'Esta reacción es de un comando de categoria Premium, adquiere la membresía en el [Servidor de soporte.](https://discord.sophia-bot.com).',
								)
								.setColor('RED')
								.setTimestamp(),
						],
						ephemeral: true,
					})
				}
			}

			const systemschema = require('../models/verificacion-boton.js')
			const composystem = await systemschema.findOne({
				ServerID: interaction.guild.id,
			})

			if (
				composystem &&
				interaction.channel.id === composystem.ChannelID &&
				interaction.guild.roles.cache.get(composystem.RolID)
			) {
				if (interaction.member.roles.cache.has(composystem.RolID)) {
					await interaction.member.roles
						.remove(composystem.RolID)
						.catch(async () => {
							return await interaction.followUp({
								embeds: [
									new MessageEmbed()
										.setTitle('❌ Error')
										.setDescription(
											'No se te ha podido remover el rol.\nEs posible que me falten permisos, contacta con un administrador para solucionarlo!',
										)
										.setColor('RED'),
								],
								ephemeral: true,
							})
						})
					await interaction.followUp({
						embeds: [
							new MessageEmbed()
								.setTitle('Rol Removido')
								.setDescription(
									`**${interaction.member.user.tag}** se te ha removido el rol <@&${composystem.RolID}> correctamente.`,
								)
								.setColor('GREEN'),
						],
						ephemeral: true,
					})
				} else {
					await interaction.member.roles
						.add(composystem.RolID)
						.catch(async () => {
							return await interaction.followUp({
								embeds: [
									new MessageEmbed()
										.setTitle('❌ Error')
										.setDescription(
											'No se te ha podido añadir el rol.\nEs posible que me falten permisos, contacta con un administrador para solucionarlo!',
										)
										.setColor('RED'),
								],
								ephemeral: true,
							})
						})
					await interaction.followUp({
						embeds: [
							new MessageEmbed()
								.setTitle('Rol añadido')
								.setDescription(
									`**${interaction.member.user.tag}** se te ha añadido el rol <@&${composystem.RolID}> correctamente.`,
								)
								.setColor('GREEN'),
						],
						ephemeral: true,
					})
				}
			}
		}
	}
	if (interaction.isCommand()) {
		if (!interaction.guild) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(':x: Error')
						.setDescription(
							'¿Que intentas hacer?\nMis comandos no se pueden usar en mi privado!',
						)
						.setColor('RED'),
				],
			})
		}

		const slashcmds = client.sc.get(interaction.commandName)
		if (!slashcmds) return
		const deletedates = await data_deletedate.findOne({ UserID: interaction.user.id })
		if (deletedates) return

		if (slashcmds.userPerms) {
			if (!interaction.member.permissions.has(slashcmds.userPerms || [])) {
				return interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle('❌ Error')
							.setColor('RED')
							.setDescription(
								`No tienes estos permisos: \`${slashcmds.userPerms}\` `,
							),
					],
					ephemeral: true,
				})
			}
		}
		if (slashcmds.botPerms) {
			if (!interaction.guild.me.permissions.has(slashcmds.botPerms || [])) {
				return interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle('❌ Error')
							.setColor('RED')
							.setDescription(
								`No tengo estos permisos: \`${slashcmds.botPerms}\` `,
							),
					],
					ephemeral: true,
				})
			}
		}
		if (slashcmds.devOnly === true && !client.guilds.cache.get("878037227005968414").members.cache.get(interaction.user.id).roles.has('979532801915363379')) /*if (slashcmds.devOnly && interaction.user.id !== "795127511204888596")*/ {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(':x: Error')
						.setDescription(
							'Solo los developers del Bot pueden usar este comando.',
						)
						.setColor('RED')
						.setTimestamp(),
				],
				ephemeral: true,
			})
		}

		if (slashcmds.isPremium === true) {
			const premium = await premiumguild.findOne({ ServerID: interaction.guildId })
			if (!premium) {
				return interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle(':x: Error')
							.setDescription(
								'Este comando es de categoria Premium, adquiere la membresía en el [Servidor de soporte.](https://discord.sophia-bot.com).',
							)
							.setColor('RED')
							.setTimestamp(),
					],
					ephemeral: true,
				})
			}
		}
		if (
			slashcmds.isMaintenance === true &&
			!config.owner.includes(interaction.user.id)
		) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle('⚠ Comando en mantenimiento....')
						.setTimestamp(new Date())
						.setColor('YELLOW'),
				],
				ephemeral: true,
			})
		}

		const limit = require('../models/limitusecommands')
		const com = await limit.findOne({ ServerID: interaction.guild.id })

		if (com && interaction.channel.id !== com.ChannelID) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle('Hey, espera! 💔')
						.setDescription(
							`En este servidor mi uso de comandos esta limitado a el canal <#${com.ChannelID}> ve allí y reintenta.`,
						)
						.setColor('RED'),
				],
				ephemeral: true,
			})
		}

		try {
			const blackuser = require('../models/blacklist-user')
			const blackguild = require('../models/blacklist-guild')
			const server = await blackguild.findOne({ ServerID: interaction.guildId })
			const user = await blackuser.findOne({ UserID: interaction.user.id })

			if (user) {
				return interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle(':x: Error')
							.setDescription(
								`Hey que tal \`${interaction.user.tag}\` lamentablemente no puedes usar mis comandos porque estás dentro de la blacklist.`,
							)
							.addField('`📑` | Razon', `\`${user.Reason}\``, true)
							.addField(
								'`📆` | Fecha',
								`<t:${Math.floor(user.Date / 1000)}:F>`,
								true,
							)
							.setColor('RED'),
					],
				})
			}
			if (server) {
				return interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle(':x: Error')
							.setDescription(
								`Hey que tal \`${interaction.user.tag}\` lamentablemente no puedes usar mis comandos en \`${interaction.guild.name}\` porque esta dentro de la blacklist.`,
							)
							.addField('`📑` | Razon', `\`${server.Reason}\``, true)
							.addField(
								'`📆` | Fecha',
								`<t:${Math.floor(server.Date / 1000)}:F>`,
								true,
							)
							.setColor('RED'),
					],
				})
			}
			await slashcmds.run(client, interaction)
		} catch (e) {
			console.error(e)

			const embedError = new MessageEmbed()
				.setColor('#FF5252')
				.setDescription(
					':x: | Ha ocurrido un error inesperado, vuelve a intentarlo.',
				)
				.setThumbnail(client.user.displayAvatarURL({ size: 4096 }))

			interaction.reply({ embeds: [embedError] }).catch(() => null)
		}
	}
})
