const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder } = require('@discordjs/builders')
const { Collection } = require('discord.js-light')
const fs = require('fs')
const subcmds = new Collection()
/**
* @type {import('../../types/typeslash').Command}
*/

const command = {
	category: 'Economía',

	data: new SlashCommandBuilder()
		.setName('casino')
		.setDescription('Comandos de casino del servidor.'),

	/**
	 * @param {Client} _client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const subcmd = interaction.options.getSubcommand()
		subcmds.get(subcmd).run(client, interaction)
	},
}

fs.readdirSync('./slashcommands/economy/subcmd-casino')
	.filter((file) => file.endsWith('.js'))
	.forEach((file) => {
		const subcmd = require(`./subcmd-casino/${file}`)

		subcmd.data instanceof SlashCommandSubcommandGroupBuilder ?
			command.data.addSubcommandGroup(subcmd.data) : command.data.addSubcommand(subcmd.data)

		subcmds.set(subcmd.data.name, subcmd)
	})

module.exports = command