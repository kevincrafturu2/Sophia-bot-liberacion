const { SlashCommandSubcommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const schema = require('../../../models/shop-model.js')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['MANAGE_GUILD'],
	botPerms: ['MANAGE_GUILD'],
	category: 'Economía',

	data: new SlashCommandSubcommandBuilder()
		.setName('remove-item')
		.setDescription('Elimina un objeto de la tienda!')
		.addIntegerOption((o) =>
			o
				.setName('id-item')
				.setDescription('ID del objeto en la tienda.')
				.setRequired(true),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		schema.findOne(
			{
				guildid: interaction.guild.id,
			},
			(err, results) => {
				if (err) throw err
				if (results) {
					const err = new MessageEmbed().setTitle(':x: Error').setColor('RED')

					if (!Number.isInteger(interaction.options.getInteger('id-item'))) {
						return interaction.reply({
							embeds: [
								err.setDescription('Debes poner un número positivo!'),
							],
							ephemeral: true,
						})
					}

					if (isNaN(interaction.options.getInteger('id-item'))) {
						err.setDescription('Debes ingresar un número!')
						return interaction.reply({ embeds: [err], ephemeral: true })
					}
					const number = parseInt(interaction.options.getInteger('id-item')) - 1
					if (results.store.length < number) {
						const err = new MessageEmbed()
							.setTitle(':x: Error')
							.setColor('RED')
							.setDescription('Este producto no existe.')
						return interaction.reply({ embeds: [err], ephemeral: true })
					}
					results.store.splice(number, 1)
					results.save()
					const exi = new MessageEmbed()
						.setTitle('✅ Todo ha salido bien')
						.setColor('GREEN')
						.setDescription('producto removido con exito!')
					interaction.reply({ embeds: [exi] })
				} else {
					const err = new MessageEmbed()
						.setTitle(':x: Error')
						.setColor('RED')
						.setDescription('No hay ningún producto en el tienda!')
					interaction.reply({ embeds: [err], ephemeral: true })
				}
			},
		)
	},
}

module.exports = command
