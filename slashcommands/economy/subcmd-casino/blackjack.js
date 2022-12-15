const { SlashCommandSubcommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js-light')
const economyModel = require('../../../models/economy-model')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	category: 'Economía',

	data: new SlashCommandSubcommandBuilder()
		.setName('blackjack')
		.setDescription('Juega al blackjack.')
		.addIntegerOption(o =>
			o
				.setName('cantidad')
				.setDescription('La cantidad de dinero que quieres apostar.')
				.setRequired(true),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(_, interaction) {
		const amount = interaction.options.getInteger('cantidad')

		if (amount < 50) return await interaction.reply('Debes apostar más de 50$!')

		const balance = await economyModel.findOne({
			guildid: interaction.guild.id,
			userid: interaction.user.id,
		})

		if (!balance || balance.money < amount) return await interaction.reply('No tienes suficiente dinero para apostar!')

		const deck = [
			{
				value: 'A',
				name: '<:ASophia:999528263112212501>',
			},
			{
				value: '2',
				name: '<:2Sophia:999528246603415622>',
			},
			{
				value: '3',
				name: '<:3Sophia:999528250416054362>',
			},
			{
				value: '4',
				name: '<:4Sophia:999528251863093298>',
			},
			{
				value: '5',
				name: '<:5Sophia:999528253293346857>',
			},
			{
				value: '6',
				name: '<:6Sophia:999528254862008340>',
			},
			{
				value: '7',
				name: '<:7Sophia:999528256543920149>',
			},
			{
				value: '8',
				name: '<:8Sophia:999528257995165716>',
			},
			{
				value: '9',
				name: '<:9Sophia:999528259266039941>',
			},
			{
				value: '10',
				name: '<:10Sophia:999528261493203065>',
			},
			{
				value: 'J',
				name: '<:JSophia:999528265096101989>',
			},
			{
				value: 'Q',
				name: '<:QSophia:999528268757729371>',
			},
			{
				value: 'K',
				name: '<:KSophia:999528267168092251>',
			},
		]

		const player = []
		const playerHand2 = []
		const dealer = []

		const getCardValue = card => {
			if (card === 'A') return 1
			else if (card === 'J' || card === 'Q' || card === 'K') return 10
			else return parseInt(card)
		}

		const scores = {
			playerScore() {
				let score = 0
				player.forEach(card => {
					score += getCardValue(card.value)
				})
				return score
			},

			playerScoreHand2() {
				let score = 0
				playerHand2.forEach(card => {
					score += getCardValue(card.value)
				})
				return score
			},

			dealerScore() {
				let score = 0
				dealer.forEach(card => {
					score += getCardValue(card.value)
				})
				return score
			},
		}

		const getWinner = () => {
			if ((scores.playerScore() > scores.dealerScore() && scores.playerScore() <= 21) ||
			(scores.playerScoreHand2() > scores.dealerScore() && scores.playerScoreHand2() <= 21)) return 'player'

			if ((scores.dealerScore() > scores.playerScore() && scores.dealerScore() <= 21)) return 'dealer'
			if (scores.playerScore() > 21) return 'dealer'
			if (scores.dealerScore() > 21) return 'player'
			return null
		}

		const hit = (user) => {
			const card = deck[Math.floor(Math.random() * deck.length)]
			user.push(card)
			return card
		}

		const generateEmbed = (options) => {
			options = options || {}
			const playerText = options.playerText || 'Jugador'
			const hand = options.hand || player
			const color = options.color || '#0099ff'
			const playerScoreO = scores.playerScore()

			const gameEmbed = new MessageEmbed()
				.setTitle('Blackjack')
				.addField(playerText, hand.map(card => `${card.name}`).join(' ') + `\n\nPuntos: ${playerScoreO}`, true)
				.addField('Dealer', dealer.map(card => `${card.name}`).join(' ') + `\n\nPuntos: ${scores.dealerScore()}`, true)
				.setColor(color)
				.setThumbnail(interaction.user.avatarURL())
				.setTimestamp()

			return gameEmbed
		}

		const hitButton = new MessageButton()
			.setLabel('nueva carta')
			.setStyle('PRIMARY')
			.setCustomId('hit')

		const standButton = new MessageButton()
			.setLabel('terminar')
			.setStyle('PRIMARY')
			.setCustomId('stand')

		const doubleDownButton = new MessageButton()
			.setLabel('doblar')
			.setStyle('SECONDARY')
			.setCustomId('doubleDown')

		const splitButton = new MessageButton()
			.setLabel('dividir')
			.setStyle('SECONDARY')
			.setCustomId('split')

		const row = new MessageActionRow()
			.addComponents(hitButton, standButton, doubleDownButton, splitButton)

		const playercard1 = hit(player)
		if (playercard1 === hit(player)) player.push('Q')

		hit(dealer)
		hit(dealer)

		getCardValue(player[0]) === getCardValue(player[1]) ? splitButton.setDisabled(false) : splitButton.setDisabled(true)

		interaction.reply({
			embeds: [generateEmbed()],
			components: [row],
		})

		const collector = interaction.channel.createMessageComponentCollector({ filter: m => m.user.id === interaction.user.id, time: 300000 })
		let hand2 = false
		playerHand2.push(player[1])

		collector.on('collect', async m => {
			row.components.forEach(button => {
				button.setDisabled(true)
			})

			const playerText = hand2 ? 'Mano 2' : 'Jugador'
			const hand = hand2 ? playerHand2 : player
			const playerScoreO = hand2 ? scores.playerScoreHand2() : scores.playerScore()

			if (m.customId === 'hit') {
				hit(hand)

				await interaction.editReply({ embeds: [
					generateEmbed({ hand, playerText, playerScoreO }),
				] })

				if ((scores.playerScore() || scores.playerScoreHand2) === 21) {
					await interaction.editReply({ embeds: [
						generateEmbed({ color: '#00ff00', hand, playerText, playerScoreO }).addField('Jugador', '¡Has ganado!'),
					], components: [row] })
					collector.stop()
				}

				if (scores.playerScoreHand2() > 21) {
					hand2 = false
					await interaction.editReply({ embeds: [
						generateEmbed({ color: '#00ff00', hand: player, playerText: 'Jugador', playerScoreO }),
				 	] })
				}


				if (scores.playerScore() > 21) {
					await economyModel.updateOne({
						guildid: interaction.guild.id,
						userid: interaction.user.id,
					}, {
						$inc: {
							money: -amount,
						},
					})

					await interaction.editReply({
						embeds: [
							generateEmbed({ color: '#ff0000', hand, playerText, playerScoreO }).addField('Jugador', '¡Has perdido!'),
						], components: [row] })
					return collector.stop()
				}
			}

			if (m.customId === 'stand') {
				hit(dealer)
				while (scores.dealerScore() < 17) hit(dealer)

				const winner = getWinner()
				if (winner === 'player') {
					await economyModel.updateOne(
						{
							guildid: interaction.guild.id,
							userid: interaction.user.id,
						},
						{
							$inc: {
								money: amount,
							},
						},
					)

					await interaction.editReply({
						embeds: [
							generateEmbed({ color: '#00ff00', hand, playerText, playerScoreO }).addField('Jugador', '¡Has ganado!'),
						], components: [row] })

					return collector.stop()
				}

				if (winner === 'dealer') {
					await economyModel.updateOne(
						{
							guildid: interaction.guild.id,
							userid: interaction.user.id,
						},
						{
							$inc: {
								money: -amount,
							},
						},
					)

					await interaction.editReply({
						embeds: [
							generateEmbed({ color: '#ff0000', hand, playerText, playerScoreO }).addField('Jugador', '¡Has perdido!'),
						], components: [row] })

					return collector.stop()
				}
			}

			if (m.customId === 'doubleDown') {
				hit(hand)
				hit(dealer)

				const winner = getWinner()
				if (winner === 'player') {
					await economyModel.updateOne(
						{
							guildid: interaction.guild.id,
							userid: interaction.user.id,
						},
						{
							$inc: {
								money: amount * 2,
							},
						},
					)

					await interaction.editReply({
						embeds: [
							generateEmbed({ color: '#00ff00', hand, playerText, playerScoreO }).addField('Jugador', '¡Has ganado!'),
						], components: [row] })

					return collector.stop()
				}

				// if ()

				if (winner === 'dealer') {
					await economyModel.updateOne(
						{
							guildid: interaction.guild.id,
							userid: interaction.user.id,
						},
						{
							$inc: {
								money: -amount * 2,
							},
						},
					)

					await interaction.editReply({
						embeds: [
							generateEmbed({ color: '#ff0000', hand, playerText, playerScoreO }).addField('Jugador', '¡Has perdido!'),
						], components: [row] })

					return collector.stop()
				}
			}

			// if (m.customId === 'split') {
			// 	hand2 = true
			// 	hit(playerHand2)

			// 	await interaction.editReply({
			// 		embeds: [
			// 			generateEmbed({ playerText: 'Mano 2', hand: playerHand2, playerScoreO }),
			// 		] })
			// }
		})

	},
}

module.exports = command