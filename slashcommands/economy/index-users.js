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
		.setName('economy-users')
		.setDescription('Comandos de economía que usan los usuarios.'),

	/**
	 * @param {Client} _client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const subcmd = interaction.options.getSubcommand()
		subcmds.get(subcmd).run(client, interaction)
	},
}

fs.readdirSync('./slashcommands/economy/subcmd-users')
	.filter((file) => file.endsWith('.js'))
	.forEach((file) => {
		const subcmd = require(`./subcmd-users/${file}`)

		subcmd.data instanceof SlashCommandSubcommandGroupBuilder ?
			command.data.addSubcommandGroup(subcmd.data) : command.data.addSubcommand(subcmd.data)

		subcmds.set(subcmd.data.name, subcmd)
	})

module.exports = command