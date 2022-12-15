const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const ms = require('ms')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['MANAGE_CHANNELS'],
	botPerms: ['MANAGE_CHANNELS'],
	category: 'Configuración',

	data: new SlashCommandBuilder()
		.setName('slowmode')
		.setDescription(
			'Establece el tiempo de espera entre mensajes de el canal actual.',
		)
		.addStringOption((o) =>
			o
				.setName('tiempo')
				.setDescription(
					'El tiempo de espera (h: horas, m: minutos: s: segundos, off) ej: 15s.',
				)
				.setRequired(true),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {Interaction} interaction
	 */

	async run(_, interaction) {
		const args = interaction.options
		const time = args.getString('tiempo')

		if (time === 'off') {
			if (interaction.channel.rateLimitPerUser == 0) {
				return interaction.reply({
					embeds: [
						{
							title: '❌ Error',
							description:
								'¿Por qué quieres deshabilitar algo que ya está deshabilitado?',
							color: 'RED',
						},
					],
				})
			}
			interaction.channel.setRateLimitPerUser(0)

			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle('✅ Hecho')
						.setDescription('EL slowmode de este canal ha sido desactivado.')
						.setColor('GREEN'),
				],
			})
		}
		const convert = ms(time)
		const toSecond = Math.floor(convert / 1000)
		if (!toSecond || toSecond == undefined) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(':x: Error')
						.setDescription('Debes poner un tiempo valido.')
						.setColor('RED'),
				],
				ephemeral: true,
			})
		}

		if (convert > 21600000) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(':x: Error')
						.setDescription('Debes poner un tiempo de menos de 6 horas.')
						.setColor('RED'),
				],
				ephemeral: true,
			})
		}

		if (toSecond < 1) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(':x: Error')
						.setDescription('Debes poner un tiempo mayor a 1s.')
						.setColor('RED'),
				],
				ephemeral: true,
			})
		}

		await interaction.channel.setRateLimitPerUser(toSecond).catch(async (err) => {
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(':x: Error')
						.setDescription(
							'Hubo un error inesperado, ya fue avisado a mis creadores.',
						)
						.setColor('RED'),
				],
				ephemeral: true,
			})
			return console.log(err.stack)
		})

		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setTitle('✅ Hecho')
					.setDescription(
						`El slowmode de este canal ha sido cambiado a: \`${time}\``,
					)
					.setColor('GREEN')
					.setTimestamp(),
			],
		})
	},
}

module.exports = command
