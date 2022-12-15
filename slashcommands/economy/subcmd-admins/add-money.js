const { SlashCommandSubcommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const schema = require('../../../models/economy-model.js')
const schemaBank = require('../../../models/bank-model.js')
const bigInt = require('big-integer')

/**
 * @type {import('../../../types/typeslash').Command}
 */

const command = {
	userPerms: ['MANAGE_GUILD'],
	category: 'Economía',

	data: new SlashCommandSubcommandBuilder()
		.setName('add-money')
		.setDescription('Agrega dinero a un usuario.')
		.addUserOption((o) =>
			o
				.setName('usuario')
				.setDescription('Usuario al que se le agregará dinero')
				.setRequired(true),
		)
		.addIntegerOption((o) =>
			o
				.setName('cantidad')
				.setDescription('Cantidad de dinero a agregar')
				.setRequired(true),
		)
		.addStringOption((o) =>
			o
				.setName('lugar')
				.setDescription('Lugar donde se agregará dinero')
				.setRequired(false)
				.addChoices({ name: 'banco', value: 'bank' }),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(_, interaction) {
		const args = interaction.options
		const err = new MessageEmbed().setTitle(':x: Error').setColor('RED')

		const exi = new MessageEmbed()
			.setTitle('🏦 Transaccion exitosa')
			.setColor('GREEN')

		const mention = interaction.guild.members.cache.get(args.getUser('usuario').id)
		if (mention.user.bot) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(':x: Error')
						.setDescription('Los bots no son parte de la economía.')
						.setColor('RED'),
				],
			})
		}

		const canti = args.getInteger('cantidad')
		if (!Number.isInteger(canti)) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(':x: Error')
						.setDescription('Ingresa un numero valido.')
						.setColor('RED'),
				],
			})
		}
		const cantidad = bigInt(canti)
		if (cantidad < 1) {
			err.setDescription('ℹ Debes poner un numero mayor a 0!')
			return await interaction.reply({ embeds: [err], ephemeral: true })
		}

		if (args.getString('lugar') === 'bank') {
			const resultsBank = await schemaBank.findOne({
				guildid: interaction.guild.id,
				userid: mention.user.id,
			})

			if (resultsBank) {
				const addBank = bigInt(resultsBank.money) + cantidad
				await schemaBank.updateOne(
					{
						guildid: interaction.guild.id,
						userid: mention.user.id,
					},
					{
						money: addBank,
					},
				)
				exi.setDescription(
					`:atm: Se le cargaron \`${Intl.NumberFormat().format(
						cantidad,
					)}$\` en el banco a <@${mention.user.id}>`,
				)
				await interaction.reply({ embeds: [exi] })
			} else {
				const newBank = new schemaBank({
					guildid: interaction.guild.id,
					userid: mention.user.id,
					money: cantidad,
				})
				await newBank.save()
				exi.setDescription(
					`💵 Le has dado \`${Intl.NumberFormat().format(
						cantidad,
					)}$\` en efectivo a <@${mention.user.id}>`,
				)
				await interaction.reply({ embeds: [exi] })
			}
			return
		}

		const resultsWallet = await schema.findOne({
			guildid: interaction.guild.id,
			userid: mention.user.id,
		})

		if (resultsWallet) {
			const addWallet = bigInt(resultsWallet.money) + cantidad
			await resultsWallet.updateOne({
				guildid: interaction.guild.id,
				userid: mention.user.id,
				money: addWallet,
			})
			exi.setDescription(
				`💵 Le has dado \`${Intl.NumberFormat().format(
					cantidad,
				)}$\` en efectivo a <@${mention.user.id}>`,
			)
			await interaction.reply({ embeds: [exi] })
		} else {
			const newWallet = new schema({
				guildid: interaction.guild.id,
				userid: mention.user.id,
				money: cantidad,
			})
			await newWallet.save()
			exi.setDescription(
				`💵 Le has dado \`${Intl.NumberFormat().format(
					cantidad,
				)}$\` en efectivo a <@${mention.user.id}>`,
			)
			await interaction.reply({ embeds: [exi] })
		}
	},
}

module.exports = command
