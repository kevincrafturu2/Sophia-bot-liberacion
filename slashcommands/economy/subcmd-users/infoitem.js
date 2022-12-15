const { SlashCommandSubcommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const schema = require('../../../models/shop-model.js')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['SEND_MESSAGES'],
	botPerms: ['SEND_MESSAGES'],
	category: 'Economía',

	data: new SlashCommandSubcommandBuilder()
		.setName('infoitem')
		.setDescription('Iformación de un item en especifico!')
		.addIntegerOption((o) =>
			o
				.setName('id-item')
				.setDescription('ID del item en la tienda')
				.setRequired(true),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		schema.findOne({ guildid: interaction.guild.id }, (err, results) => {
			const numero = interaction.options.getInteger('id-item')

			const error = new MessageEmbed().setTitle(':x: Error').setColor('RED')

			if (err) throw err
			if (!results) {
				error.setDescription('Este servidor no tiene tienda')
				return interaction.reply({ embeds: [error], ephemeral: true })
			}
			if (!results.store) {
				error.setDescription('Este servidor no tiene nada en la tienda')
				return interaction.reply({ embeds: [error], ephemeral: true })
			}
			if (!Number.isInteger(numero) || isNaN(numero)) {
				error.setDescription('Debes ingresar un número!')
				return interaction.reply({ embeds: [error], ephemeral: true })
			}
			if (!results.store[parseInt(numero) - 1]) {
				error.setDescription('Este item no existe!')
				return interaction.reply({ embeds: [error], ephemeral: true })
			}

			const item = results.store[parseInt(numero) - 1]
			let isrole = 'No'
			if (item.product.startsWith('<@')) isrole = 'Si'
			if (isrole == 'Si')
				item.product = '`rol `' + item.product
			else
				item.product = '`' + item.product + '`'

			const embedSuccess = new MessageEmbed()
				.setTitle('Información del producto')
				.addField('producto', item.product)
				.addField('Rol', '`' + isrole + '`')
				.addField('Descripción', '`' + item.description + '`')
				.addField('Precio', '`' + item.price + '$`')
				.setColor('#00FFFF')
				.setFooter({
					text: 'info-item Sophia Economía!',
					iconURL: client.user.displayAvatarURL(),
				})
				.setTimestamp()
			interaction.reply({ embeds: [embedSuccess] })
		})
	},
}

module.exports = command
