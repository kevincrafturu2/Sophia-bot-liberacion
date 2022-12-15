const { SlashCommandSubcommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const schema = require('../../../models/economy-model.js')
const schemaBank = require('../../../models/bank-model.js')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['SEND_MESSAGES'],
	category: 'Economía',

	data: new SlashCommandSubcommandBuilder()
		.setName('dep')
		.setDescription('Deposita dinero en tu banco.')
		.addStringOption((o) =>
			o
				.setName('cantidad')
				.setDescription('cantidad a depositar')
				.setRequired(true),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const err = new MessageEmbed().setTitle(':x: Error').setColor('RED')
		const args = interaction.options
		let money = parseInt(args.getString('cantidad'))

		const resultsWallet = await schema.findOne({
			guildid: interaction.guild.id,
			userid: interaction.user.id,
		})
		const resultsBank = await schemaBank.findOne({
			guildid: interaction.guild.id,
			userid: interaction.user.id,
		})

		if ((!['all', 'max'].includes(money) && isNaN(money)) || (!['all', 'max'].includes(money) && !Number.isInteger(money))) {
			err.setDescription('Debes poner un numero valido!')
			return interaction.reply({ embeds: [err], ephemeral: true })
		}
		if (!resultsWallet || resultsWallet.money === 0) {
			err.setDescription('No tienes dinero para depositar!')
			return interaction.reply({ embeds: [err], ephemeral: true })
		}
		if (resultsWallet.money < parseInt(money)) {
			err.setDescription('No tienes ese dinero!')
			return interaction.reply({ embeds: [err], ephemeral: true })
		}

		if (['all', 'max'].includes(money)) money = resultsWallet.money

		if (!['all', 'max'].includes(money) && parseInt(money) < 1) {
			err.setDescription('Debes poner un numero mayor a 0!')
			return interaction.reply({ embeds: [err], ephemeral: true })
		}

		if (resultsBank) {
			const addBank = parseInt(resultsBank.money) + parseInt(money)
			const rmvWallet = parseInt(resultsWallet.money) - parseInt(money)

			await schemaBank.updateOne(
				{
					guildid: interaction.guild.id,
					userid: interaction.user.id,
				},
				{
					money: addBank,
				},
			)
			await schema.updateOne(
				{
					guildid: interaction.guild.id,
					userid: interaction.user.id,
				},
				{
					money: rmvWallet,
				},
			)
		} else {
			const rmvEco = parseInt(resultsWallet.money) - parseInt(money)
			await schema.updateOne(
				{
					guildid: interaction.guild.id,
					userid: interaction.user.id,
				},
				{
					money: rmvEco,
				},
			)

			const newBank = new schemaBank({
				guildid: interaction.guild.id,
				userid: interaction.user.id,
				money: money,
			})

			await newBank.save()
		}

		const embedSuccess = new MessageEmbed()
			.setDescription(
				`**${interaction.user.username}** has depositado \`${money}$\``,
			)
			.setColor('GREEN')
			.setTimestamp()
			.setFooter({
				text: `${interaction.user.username}`,
				iconURL: `${interaction.user.avatarURL()}`,
			})
		interaction.reply({ embeds: [embedSuccess] })
	},
}

module.exports = command
