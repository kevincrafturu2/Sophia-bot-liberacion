const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js-light')
const schema = require('../../models/suggestions-model.js')

module.exports = {
	category: 'Configuración',
	userPerms: ['MANAGE_CHANNELS'],
	data: new SlashCommandBuilder()
		.setName('setsuggest')
		.setDescription('Establece el canal donde se envían las sugerencias.')
		.addChannelOption((o) =>
			o
				.setName('canal')
				.setDescription('En este canal se enviarán las sugerencias.')
				.setRequired(true),
		),

	async run(client, interaction) {
		const args = interaction.options
		const channel = args.getChannel('canal')
		const results = await schema.findOne({ guildid: interaction.guild.id })
		if (!channel.viewable) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(':x: Error')
						.setDescription('No puedo ver o escribir en ese canal.')
						.setColor('RED'),
				],
				ephemeral: true,
			})
		}
		if (channel.type !== 'GUILD_TEXT') {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(':x: Error')
						.setDescription('El canal debe ser de texto.')
						.setColor('RED'),
				],
				ephemeral: true,
			})
		}
		if (results) {
			const accept = new MessageButton()
				.setLabel('continuar')
				.setCustomId('accept')
				.setStyle('SUCCESS')
			const cancel = new MessageButton()
				.setLabel('cancelar')
				.setCustomId('cancel')
				.setStyle('DANGER')
			const row = new MessageActionRow().addComponents(accept, cancel)

			// sendmsg no es utilizado
			// eslint-disable-next-line no-unused-vars
			const sendmsg = await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle('Estás seguro de cambiar el canal de sugerencias?')
						.setColor('YELLOW'),
				],
				components: [row],
			})
			const filter = (b) => b.user.id === interaction.user.id
			const collector = interaction.channel.createMessageComponentCollector(
				filter,
				{ time: 60000 },
			)
			collector.on('collect', async (b) => {
				if (b.user.id !== interaction.user.id) {
					return interaction.reply({
						content: 'Solo el que puso el comando puede interactuar!',
						ephemeral: true,
					})
				}
				if (b.customId === 'accept') {
					b.deferUpdate()
					await schema.updateOne(
						{
							guildid: interaction.guild.id,
						},
						{
							guildid: interaction.guild.id,
							channelid: channel.id,
						},
					)
					interaction.editReply({
						embeds: [
							new MessageEmbed()
								.setTitle('✅ canal establecido correctamente')
								.setColor('GREEN'),
						],
						components: [],
					})
				}

				if (b.customId === 'cancel') {
					b.deferUpdate()
					await interaction.deleteReply()
					return
				}
			})
			return
		}

		const newSuggestionChannel = new schema({
			guildid: interaction.guild.id,
			channelid: channel.id,
		})

		await newSuggestionChannel.save().catch((err) => console.log(err))
		return interaction.reply({
			embeds: [
				new MessageEmbed()
					.setTitle('✅ canal establecido correctamente')
					.setColor('GREEN'),
			],
		})
	},
}
