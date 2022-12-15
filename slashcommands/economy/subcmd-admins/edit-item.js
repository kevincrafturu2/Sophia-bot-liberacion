const { SlashCommandSubcommandGroupBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const schema = require('../../../models/shop-model.js')
const bigInt = require('big-integer')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['MANAGE_GUILD'],
	category: 'Economía',

	data: new SlashCommandSubcommandGroupBuilder()
		.setName('edit-item')
		.setDescription('Edita un producto de la tienda')

		.addSubcommand((o) =>
			o
				.setName('nombre-o-rol')
				.setDescription('Nombre del producto o rol')
				.addIntegerOption((z) =>
					z
						.setName('numero-del-producto')
						.setDescription('Numero del producto en la tienda.')
						.setRequired(true),
				)
				.addStringOption((e) =>
					e
						.setName('value')
						.setRequired(true)
						.setDescription('Nuevo nombre o rol'),
				),
		)

		.addSubcommand((o) =>
			o
				.setName('precio')
				.setDescription('Precio del producto')
				.addIntegerOption((z) =>
					z
						.setName('numero-del-producto')
						.setDescription('Numero del producto en la tienda.')
						.setRequired(true),
				)
				.addStringOption((e) =>
					e
						.setName('value')
						.setRequired(true)
						.setDescription('Nuevo precio del producto'),
				),
		)

		.addSubcommand((o) =>
			o
				.setName('descripcion')
				.setDescription('Descripción del producto')
				.addIntegerOption((z) =>
					z
						.setName('numero-del-producto')
						.setDescription('Numero del producto en la tienda.')
						.setRequired(true),
				)
				.addStringOption((e) =>
					e
						.setName('value')
						.setRequired(true)
						.setDescription('Nueva descripción del producto'),
				),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(_, interaction) {
		function err(text = 'hubo un error') {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(':x: Error')
						.setColor('RED')
						.setDescription(text),
				],
			})
		}
		const subcommand = interaction.options.getSubcommand()

		const value = interaction.options.getString('value')
		let numero = interaction.options.getInteger('numero-del-producto')
		numero = parseInt(numero) - 1

		if (!Number.isInteger(numero)) {
			return interaction.reply({
				embeds: [err.setDescription('Debes poner un número entero!')],
				ephemeral: true,
			})
		}

		schema.findOne({ guildid: interaction.guild.id }, async (error, results) => {
			if (error) throw error
			const item = await results.store[numero]
			if (!results || !item) return err('No se encontró el producto')
			switch (subcommand) {
			case 'nombre-o-rol':
				item.product = value
				break

			case 'precio':
				item.price = value
				break

			case 'descripcion':
				if (value.length > 100)
					return err('La descripción no puede tener más de 100 caracteres')
					  if (value.length < 12)
						  return err('La descripción debe tener más de 12 caracteres')
					  item.description = value
				break
			}
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(':white_check_mark: producto editado correctamente')
						.setColor('GREEN')
						.addField('producto', results.store[numero].product)
						.addField(
							'precio',
							Intl.NumberFormat().format(
								bigInt(results.store[numero].price),
							),
						)
						.addField('descripción', results.store[numero].description),
				],
			})
			results.markModified('store')
			results.save()
		})
	},
}

module.exports = command
