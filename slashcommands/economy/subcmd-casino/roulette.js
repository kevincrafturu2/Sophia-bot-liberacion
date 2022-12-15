const { SlashCommandSubcommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const economyModel = require('../../../models/economy-model')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	category: 'Economía',

	data: new SlashCommandSubcommandBuilder()
		.setName('roulette')
		.setDescription('Juega a la ruleta.')
		.addIntegerOption((o) =>
			o
				.setName('cantidad')
				.setDescription('La cantidad de dinero que quieres apostar.')
				.setRequired(true),
		)
		.addStringOption((o) =>
			o
				.setName('apuesta')
				.setDescription('El color o número por el que quieres apostar.')
				.setRequired(true),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(_, interaction) {
		const options = interaction.options
		const amount = options.getInteger('cantidad')
		const option = options.getString('apuesta')

		const balance = await economyModel.findOne({
			guildid: interaction.guild.id,
			userid: interaction.user.id,
		})

		const err = new MessageEmbed().setTitle(':x: Error').setColor('RED')

		if (!balance || balance.money < amount) {
			err.setDescription('No tienes suficiente dinero para apostar!')
			return interaction.reply({ embeds: [err], ephemeral: true })
		}

		if (amount && parseInt(amount) < 50) {
			err.setDescription('Debes poner un numero mayor a 50!')
			return interaction.reply({ embeds: [err], ephemeral: true })
		}

		function isOptionValid(text) {
			if (['red', 'black'].includes(text) || (Number.isInteger(Number(text)) && Number(text) >= 1 && Number(text) <= 36))
				return true
			else return false
		}

		if (!isOptionValid(option)) {
			err.setDescription('Debes poner un color o un número entre 1 y 36 o un color (red, black).')
			interaction.reply({ embeds: [err], ephemeral: true })
		}

		const randomNumber = Math.floor(Math.random() * 36) + 1
		const colorRandom = randomNumber % 2 === 0 ? 'red' : 'black'

		const isWinner = option === colorRandom || option === randomNumber

		const embed = new MessageEmbed()
			.setTitle(':game_die: Ruleta')
			.setDescription((isWinner ? 'Has ganado!' : 'Has perdido!') + `\n Ha salido: **${colorRandom}** (${randomNumber})`)
			.setColor('GREEN')

		await economyModel.updateOne(
			{ guildid: interaction.guild.id, userid: interaction.user.id },
			{ $inc: { money: isWinner ? amount : -amount } },
		)

		interaction.reply({ embeds: [embed] })
	},
}

module.exports = command
