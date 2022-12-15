const { SlashCommandSubcommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const remove = require('../../../helpers/comando-remove-money')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['MANAGE_GUILD'],
	category: 'Economía',

	data: new SlashCommandSubcommandBuilder()
		.setName('remove-money')
		.setDescription('Quita dinero a un usuario.')
		.addUserOption((o) =>
			o
				.setName('usuario')
				.setDescription('Usuario al que se le quitará dinero')
				.setRequired(true),
		)
		.addIntegerOption((o) =>
			o
				.setName('cantidad')
				.setDescription('Cantidad de dinero a quitar')
				.setRequired(true),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(_, interaction) {
		const args = interaction.options
		const mention = interaction.guild.members.cache.get(args.getUser('usuario').id)
		const err = new MessageEmbed().setTitle(':x: Error').setColor('RED')

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
		if (canti < 1) {
			err.setDescription('ℹ Debes poner un numero mayor a 0!')
			return await interaction.reply({ embeds: [err], ephemeral: true })
		}

		remove(interaction.guild.id, interaction.options.getUser('usuario').id, canti)
		const embed = new MessageEmbed()
			.setTitle('🏦 Transaccion exitosa')
			.setDescription(`Se la ha removido ${canti} a ${mention}`)
			.setColor('GREEN')

		interaction.reply({ embeds: [embed] })
	},
}

module.exports = command
