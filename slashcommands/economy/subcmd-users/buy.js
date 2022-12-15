const { SlashCommandSubcommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const schema = require('../../../models/economy-model.js')
const schemaInv = require('../../../models/inventory-model.js')
const schemaShop = require('../../../models/shop-model.js')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	category: 'Economía',

	data: new SlashCommandSubcommandBuilder()
		.setName('buy')
		.setDescription('Compra un objeto de la tienda!')
		.addIntegerOption((o) =>
			o
				.setName('numero-item')
				.setDescription('ID del item en la tienda.')
				.setRequired(true),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const err = new MessageEmbed().setTitle(':x: Error').setColor('RED')

		const exi = new MessageEmbed().setTitle('😜 Exito!').setColor('GREEN')

		const numero = interaction.options.getInteger('numero-item')
		if (!Number.isInteger(numero)) {
			return interaction.reply({
				embeds: [err.setDescription('Debes poner un número entero!')],
				ephemeral: true,
			})
		}

		const results = await schema.findOne({
			guildid: interaction.guild.id,
			userid: interaction.user.id,
		})
		const resultsInv = await schemaInv.findOne({
			guildid: interaction.guild.id,
			userid: interaction.user.id,
		})
		const resultsShop = await schemaShop.findOne({
			guildid: interaction.guild.id,
		})
		const item = parseInt(numero) - 1
		let money = 0
		if (results) money = results.money
		if (money < resultsShop.store[item].price) {
			err.setDescription('No tienes dinero suficiente')
			return interaction.reply({ embeds: [err], ephemeral: true })
		}
		if (
			resultsInv &&
			resultsInv.inventory.map((i) => i.id).includes(resultsShop.store[item].id)
		) {
			// const asd = resultsInv.inventory.filter(i => i.id == resultsShop.store[item].id);
			// const amount = asd[0].amount;
			// const newAmount = amount + 1;
			// schemaInv.findOne({guildid: message.guild.id, userid: message.author.id}, (err, resultsI) => {
			//   if(err) throw err;
			// //  const F = resultsI.inventory.filter(i => i.id == results.store[item].id);
			//  function cambiarValor(valorABuscar, valorViejo, valorNuevo) {
			//   resultsI.inventory.forEach(function (elemento) { // recorremos el array

			//      //asignamos el valor del elemento dependiendo del valor a buscar, validamos que el valor sea el mismo y se reemplaza con el nuevo.
			//     elemento[valorABuscar] = elemento[valorABuscar] == valorViejo ? valorNuevo : elemento[valorABuscar]
			//   });
			//  };
			//  cambiarValor("amount", amount, newAmount);
			//  resultsI.save();
			//  console.log(resultsI.inventory);
			// })
			// return message.reply("Item agregado correctamente");
			err.setDescription('Ya tienes ese item')
			return interaction.reply({ embeds: [err], ephemeral: true })
		} else {
			const addItem = {
				product: resultsShop.store[item].product,
				id: resultsShop.store[item].id,
				description: resultsShop.store[item].description,
				rolId: resultsShop.store[item].rolId,
				amount: 1,
			}

			if (resultsInv) {
				await schemaInv.updateOne(
					{
						guildid: interaction.guild.id,
						userid: interaction.user.id,
					},
					{
						$push: {
							inventory: addItem,
						},
					},
				)
			} else {
				const newItem = new schemaInv({
					guildid: interaction.guild.id,
					userid: interaction.user.id,
					inventory: addItem,
				})
				newItem.save()
			}

			await schema.updateOne({
				guildid: interaction.guild.id,
				userid: interaction.user.id,
				money: money - resultsShop.store[item].price,
			})
			exi.setDescription('Item agregado! para ver tu inventario escribe: `/inv`')
			interaction.reply({ embeds: [exi] })
		}
	},
}

module.exports = command
