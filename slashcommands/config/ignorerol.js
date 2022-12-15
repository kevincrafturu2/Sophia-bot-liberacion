const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const schema = require('../../models/ignorerol')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['ADMINISTRATOR'],
	botPerms: ['ADMINISTRATOR'],
	category: 'Configuración',

	data: new SlashCommandBuilder()
		.setName('ignorerol')
		.setDescription('Establece o elimina el rol.')
		.addSubcommand((o) =>
			o
				.setName('add')
				.setDescription(
					'Establece un rol que permitira a ciertos usuarios evador el antispam y antilinks.',
				)
				// eslint-disable-next-line no-shadow
				.addRoleOption((o) =>
					o
						.setName('rol')
						.setDescription(
							'Rol que se evitara en los sistemas anti links y anti spam.',
						)
						.setRequired(true),
				),
		)
		.addSubcommand((o) => o.setName('delete').setDescription('Elimina el rol.')),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const subcmd = interaction.options.getSubcommand()
		const rol = interaction.options.getRole('rol')
		const base = await schema.findOne({ ServerID: interaction.guild.id })
		console.log(base)
		const err = new MessageEmbed().setTitle(':x: Error').setColor('RED')

		if (subcmd === 'add') {
			if (rol.tags) {
				return interaction.reply({
					embeds: [err.setDescription('No puede ser el rol de un bot!')],
					ephemeral: true,
				})
			}

			if (!base) {
				const newrol = new schema({
					ServerID: interaction.guild.id,
					RoleID: rol.id,
				})
				await newrol.save()
				return interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle('<a:cora:925477856711180379> A la orden mi capitán')
							.setDescription(
								`He establecido en mi base de datos el rol: ${rol} como rol para evadir mis sistemas. (anti links y spam)`,
							)
							.setColor('GREEN'),
					],
				})
			} else {
				return interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle(':x: Error')
							.setDescription(
								'Este servidor ya cuenta con un rol establecido!',
							)
							.setColor('RED'),
					],
					ephemeral: true,
				})
			}
		}

		if (subcmd === 'delete') {
			if (base) {
				const deleted = new MessageEmbed()
					.setTitle('✅ Hecho!')
					.setDescription(
						'El rol de evación en este servidor ha sido eliminado.',
					)
					.setColor('GREEN')

				await schema.deleteOne({ ServerID: interaction.guild.id })
				return await interaction.reply({ embeds: [deleted] })
			} else {
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle(':x: Error')
							.setDescription('No hay un rol de evación en este servidor.')
							.setColor('RED'),
					],
					ephemeral: true,
				})
			}
		}
	},
}

module.exports = command
