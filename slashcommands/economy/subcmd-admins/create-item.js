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
		.setName('create-item')
		.setDescription('Crea un item para la tienda!')
		.addStringOption((o) =>
			o
				.setName('producto')
				.setDescription('Nombre del producto.')
				.setRequired(true),
		)
		.addIntegerOption((o) =>
			o.setName('precio').setDescription('Precio del producto.').setRequired(true),
		)
		.addStringOption((o) =>
			o
				.setName('descripcion')
				.setDescription(
					'Descripcion del producto, ¿Para que sirve?, ¿Para que es?',
				),
		)
		.addRoleOption((o) =>
			o.setName('rol').setDescription('Rol que se le otorga al comprador.'),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const err = new MessageEmbed().setTitle(':x: Error').setColor('RED')

		const exi = new MessageEmbed().setColor('GREEN').setTitle('✅ Exito')

		const results = await schema.findOne({ guildid: interaction.guild.id })
		const args = interaction.options
		const productName = args.getString('producto')
		const productPrice = args.getInteger('precio')
		const productRole = args.getRole('rol')
		let productDescription = args.getString('descripcion')

		if (!Number.isInteger(productPrice)) {
			return interaction.reply({
				embeds: [err.setDescription('Debes poner un número positivo!')],
				ephemeral: true,
			})
		}

		if (productRole && !productRole.editable) {
			err.setDescription('Debes poner un rol inferior al mio!')
			return interaction.reply({ embeds: [err], ephemeral: true })
		}

		if (!productDescription) productDescription = 'Sin descripción'

		const uuid = () => {
			const { v4: uuidv4 } = require('uuid')
			const id = uuidv4()
			return id.slice(0, 8)
		}
		if (results) {
			await schema.updateOne(
				{
					guildid: interaction.guild.id,
				},
				{
					$push: {
						store: {
							id: uuid(),
							product: productName,
							price: productPrice,
							description: productDescription,
							rolId: productRole ? productRole.id : null,
						},
					},
				},
			)
			exi.setDescription('Producto agregado correctamente.')
			return interaction.reply({ embeds: [exi] })
		} else {
			const newShop = new schema({
				guildid: interaction.guild.id,
				store: {
					id: uuid(),
					product: productName,
					price: productPrice,
					description: productDescription,
					rolId: productRole ? productRole.id : null,
				},
			})
			await newShop.save()
			exi.setDescription('Producto agregado correctamente.')
			return interaction.reply({ embeds: [exi] })
		}
	},
}

module.exports = command
