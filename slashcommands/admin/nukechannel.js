/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageActionRow, MessageButton, CommandInteraction } = require('discord.js-light')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['ADMINISTRATOR'],
	botPerms: ['ADMINISTRATOR'],
	category: 'Administración',

	data: new SlashCommandBuilder()
		.setName('nukechannel')
		.setDescription('Nukea un canal de tu servidor!')
		.addChannelOption((o) =>
			o
				.setName('canal')
				.setDescription('Menciona el canal a nukear')
				.setRequired(false),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const canal = interaction.options.getChannel('canal') || interaction.channel
		const posicion = canal.position

		const row = new MessageActionRow().addComponents(
			new MessageButton()
				.setLabel('Si, estoy seguro')
				.setStyle('SECONDARY')
				.setCustomId('SI'),
			new MessageButton()
				.setLabel('No, me arrepiento')
				.setStyle('DANGER')
				.setCustomId('NO'),
		)

		const confirmacion = new MessageEmbed()
			.setTitle('⚠ Atencion')
			.setDescription(
				`➡ Estas a punto de borrar ${canal}\nTodo el progreso que haya conseguido el canal, **⚠ se perdera ⚠**\nContinuas?`,
			)
			.setColor('ORANGE')

		await interaction.reply({ embeds: [confirmacion], components: [row] })
		const iFilter = (i) => i.user.id === interaction.user.id

		const collector = interaction.channel.createMessageComponentCollector({
			filter: iFilter,
			time: 30000,
		})
		collector.on('collect', async (i) => {
			if (i.customId == 'SI') {
				if (!canal.deletable) {
					return interaction.editReply({
						embeds: [
							new MessageEmbed()
								.setTitle(':x: Error')
								.setDescription(
									'No puedo borrar o modificar ese canal actualmente, verifica que siga teniendo permisos!',
								)
								.setColor('RED'),
						],
						components: [],
						ephemeral: true,
					})
				}

				if (!['GUILD_TEXT', 'GUILD_NEWS'].includes(canal.type)) {
					return interaction.editReply({
						embeds: [
							new MessageEmbed()
								.setTitle(':x: Error')
								.setDescription(
									`No puedo borrar ${canal} ya que es un canal de voz, menciona un canal valido.`,
								)
								.setColor('RED'),
						],
						components: [],
						ephemeral: true,
					})
				}

				const canalClonado = await canal.clone()
				canalClonado.setPosition(posicion)
				setTimeout(() => {
					canal.delete()
				}, 3000)

				const Embed = new MessageEmbed()
					.setTitle(':recycle: Canal eliminado correctamente!')
					.setFooter({ text: 'Este mensaje será eliminado en 10 segundos.' })
					.setImage(
						'https://i.pinimg.com/originals/01/82/5e/01825e981b49caaa693395ca637376db.gif',
					)
					.setColor('#00FFFF')

				if (canalClonado.type == 'GUILD_TEXT') {
					await canalClonado.send({ embeds: [Embed] }).then((msg) => {
						setTimeout(() => {
							msg.delete()
						}, 10000)
					})
				}

				if (canalClonado.type == 'GUILD_VOICE') {
					interaction.editReply({
						embeds: [
							new MessageEmbed()
								.setTitle(':x: Error')
								.setDescription(
									'No puedo borrar o modificar un canal de voz!',
								)
								.setColor('RED'),
						],
						components: [],
					})
				}

				interaction.editReply({
					embeds: [
						new MessageEmbed()
							.setTitle('<a:Giveaways:878324188753068072> Perfecto')
							.setDescription(
								`He borrado ${canal}, y a la vez lo he vuelto a crear, pero... sin mensajes!`,
							)
							.setColor('GREEN'),
					],
					components: [],
				})
			}

			if (i.customId == 'NO') {
				const exit = new MessageEmbed()
					.setTitle('⬅ Saliendo')
					.setColor('WHITE')
					.setDescription('Este mensaje será eliminado.')
				interaction.editReply({ embeds: [exit], components: [] })
				setTimeout(() => interaction.deleteReply(), 5000)
			}
		})

		collector.on('end', (_collector, reason) => {
			if (reason === 'time') {
				const offTime = new MessageEmbed()
					.setColor('RED')
					.setDescription(
						'Se ha agotado el tiempo para elegir, reutiliza el comando.',
					)
					.setTitle(':x: Error')
				interaction.editReply({ embeds: [offTime], components: [] })
				setTimeout(() => interaction.deleteReply(), 5000)
			}
		})
	},
}

module.exports = command
