const { SlashCommandSubcommandGroupBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const economyModel = require('../../../models/economy-model')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	category: 'Economía',

	data: new SlashCommandSubcommandGroupBuilder()
		.setName('casino')
		.setDescription('Comandos de casino del servidor.')
		.addSubcommand((s) =>
			s
				.setName('carrera-caballos')
				.setDescription('apuesta por un caballo en una carrera de caballos.')
				.addStringOption((o) =>
					o
						.setName('caballo')
						.setDescription('el caballo por el que quieres apostar.')
						.addChoices(
							{ name: '1', value: '1' },
							{ name: '2', value: '2' },
							{ name: '3', value: '3' },
							{ name: '4', value: '4' },
						)
						.setRequired(true),
				)
				.addIntegerOption((o) =>
					o
						.setName('apuesta')
						.setDescription('la cantidad de dinero que quieres apostar.')
						.setRequired(true),
				),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(_, interaction) {
		const money = interaction.options.getInteger('apuesta')
		const balance = await economyModel.findOne({
			guildid: interaction.guild.id,
			userid: interaction.user.id,
		})

		const err = new MessageEmbed().setTitle(':x: Error').setColor('RED')

		if (!balance || balance.money < money) {
			err.setDescription('No tienes suficiente dinero para apostar!')
			return interaction.reply({ embeds: [err], ephemeral: true })
		}

		if (money && parseInt(money) < 1) {
			err.setDescription('Debes poner un numero mayor a 0!')
			return interaction.reply({ embeds: [err], ephemeral: true })
		}

		if (!Number.isInteger(money)) {
			err.setDescription('Debes poner un numero valido!')
			return interaction.reply({ embeds: [err], ephemeral: true })
		}

		const horseEmoji = '🐴'

		function generateTable(rows, columns) {
			const table = []
			for (let i = 0; i < rows; i++) {
				table[i] = []
				for (let j = 0; j < columns; j++) table[i][j] = '*'
			}
			return table
		}

		const table = generateTable(4, 10)
		const players = {
			1: {
				position: [0, 0], // [row, column]
			},
			2: {
				position: [1, 0],
			},
			3: {
				position: [2, 0],
			},
			4: {
				position: [3, 0],
			},
		}
		function updateTable() {
			const choices = Object.keys(players)

			choices.forEach((choice) => {
				switch (Math.floor(Math.random() * 2) + 1) {
				case 1:
					table[players[choice].position[0]][players[choice].position[1]] =
							'*'
					players[choice].position[1] += 1
					if (
						players[choice].position[1] >
							table[players[choice].position[0]].length - 1
					)
					{players[choice].position[1] =
								table[players[choice].position[0]].length - 1}
					break
				case 2:
					table[players[choice].position[0]][players[choice].position[1]] =
							'*'
					players[choice].position[1] += 2

					if (
						players[choice].position[1] >
							table[players[choice].position[0]].length - 1
					)
					{players[choice].position[1] =
								table[players[choice].position[0]].length - 1}
					break
				case 3:
					table[players[choice].position[0]][players[choice].position[1]] =
							'*'
					players[choice].position[1] += 3
					if (
						players[choice].position[1] >
							table[players[choice].position[0]].length - 1
					)
					{players[choice].position[1] =
								table[players[choice].position[0]].length - 1}
					break
				default:
					break
				}
			})
		}
		function drawEmojiInTable() {
			const choices = Object.keys(players)
			choices.forEach((choice) => {
				table[players[choice].position[0]][players[choice].position[1]] =
					horseEmoji
			})
		}
		function updateFrame() {
			updateTable()
			drawEmojiInTable()
			return table
		}
		function createAsciiMessage() {
			const embed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Carrera de caballos')
				.setTimestamp()
			embed.setDescription(
				'```' +
					updateFrame()
						.map((row) => row.join(' '))
						.join('```\n```') +
					'```',
			)
			return [embed]
		}
		await interaction.reply({ embeds: createAsciiMessage() })
		const winners = []

		const interval = setInterval(async () => {
			const horseSelected = interaction.options.getString('caballo')
			const winner = Object.keys(players).find(
				(choice) => players[choice].position[1] === 9,
			)
			if (winner) {
				winners.push(winner)

				await interaction.editReply({
					embeds: [
						new MessageEmbed()
							.setColor('#0099ff')
							.setTitle('Carrera de caballos')
							.setTimestamp()
							.setDescription(
								`${
									winner === horseSelected
										? '**¡Has ganado!**'
										: '**Has perdido.**'
								}\nEl ganador es el caballo número \`${winner}\``,
							),
					],
				})

				economyModel.findOne(
					{ guildid: interaction.guildId, userid: interaction.user.id },
					(err, result) => {
						if (err) throw err
						if (result) {
							if (winner === horseSelected) result.money += money
							else result.money -= money

							result.save()
						}
					},
				)

				clearInterval(interval)
			} else {
				await interaction.editReply({ embeds: createAsciiMessage() })
			}
		}, 1000)
	},
}

module.exports = command
