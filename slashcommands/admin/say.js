const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const getLanguage = require('../../functions/getLanguage')

module.exports = {
	userPerms: ['ADMINISTRATOR'],
	botPerms: ['ADMINISTRATOR'],
	category: 'Administración',
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Envia un mensaje a traves del bot.')
		// .setDescriptionLocalization('en-US', 'Send a message using the bot')
		.addStringOption((o) =>
			o
				.setName('texto')
				.setDescription('Texto que enviará el bot.')
				/* .setNameLocalization('en-US', 'text')
				.setDescriptionLocalization('en-US', 'Text that the bot will send')*/
				.setRequired(true),
		),

	async run(client, interaction) {
		const text = interaction.options.getString('texto')
		const language = getLanguage(client, interaction, 'SENDED', 'YOUR_MESSAGE_SENDED')

		const log = new MessageEmbed().setTitle('Comando Say usado.').addFields({ name: 'Texto:', value: text, inline: true }, { name: 'Autor:', value: `${client.users.cache.get(interaction.user.id).tag} (${interaction.user.id})`, inline: true }, { name: 'Servidor:', value: `${client.guilds.cache.get(interaction.guild.id).name} (${interaction.guild.id})` })
		const enviado = new MessageEmbed()
			.setTitle(`<a:TPato_Check:911378912775397436> ${language[0]}.`)
			.setDescription(language[1])
			.setColor('GREEN')

		await interaction.channel.send(`${text}`)
		interaction.reply({ embeds: [enviado], ephemeral: true })
		client.channels.cache.get('990750031697039451').send({ embeds: [log] })
	},
}
