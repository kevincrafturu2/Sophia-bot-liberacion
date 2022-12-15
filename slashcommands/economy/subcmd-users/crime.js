const { SlashCommandSubcommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js-light')
const add = require('../../../helpers/add-money.js')
const remove = require('../../../helpers/remove-money.js')
const { CommandCooldown, msToMinutes } = require('discord-command-cooldown')
const a = new CommandCooldown('crime', 600000)

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['SEND_MESSAGES'],
	botPerms: ['SEND_MESSAGES'],
	category: 'Economía',

	data: new SlashCommandSubcommandBuilder()
		.setName('crime')
		.setDescription(
			'Comete un crimen para poder ganar dinero, ten cuidado, puede salir bien o puede salir mal!',
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	async run(client, interaction) {
		const userCooldowned = await a.getUser(interaction.member.id)
		if (userCooldowned) {
			const timeLeft = msToMinutes(userCooldowned.msLeft)
			const error = new MessageEmbed()
				.setTitle(':x: Oh noooo!!!')
				.setDescription('Ya usaste el comando!, debes esperar:')
				.setColor('RED')

			if (timeLeft.hours >= 1)
				error.addField('Tiempo restante:', `${timeLeft.hours} horas`, true)

			if (timeLeft.hours == 0) {
				error.addField(
					'Tiempo restante:',
					`${timeLeft.minutes} minutos, ${timeLeft.seconds} segundos.`,
					true,
				)
			}

			await interaction.reply({ embeds: [error] })
		} else {
			const danger = ['win', 'lose']
			const crimes = [
				'asesinato',
				'robo',
				'atraco',
				'hacker',
				'homicidio calificado',
			]
			const random = danger[Math.floor(Math.random() * danger.length)]
			const randomCrime = crimes[Math.floor(Math.random() * crimes.length)]
			const randomMoney = Math.floor(Math.random() * 151)
			if (random == 'win') {
				add(interaction.guild.id, interaction.user.id, randomMoney)

				const embedWin = new MessageEmbed()
					.setDescription(
						`**${interaction.user.username}** ha cometido el crimen: **${randomCrime}** y ganó \`${randomMoney}$\``,
					)
					.setColor('GREEN')
					.setFooter({
						text: 'La próxima puede salir mal!',
						iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
					})
					.setTimestamp()
				await a.addUser(interaction.member.id)
				return interaction.reply({ embeds: [embedWin] })
			} else if (random == 'lose') {
				remove(interaction.guild.id, interaction.user.id, randomMoney)

				const embedLose = new MessageEmbed()
					.setDescription(
						`**${interaction.user.username}** ha cometido el crimen: **${randomCrime}** y lo atrapó la policía, perdió \`${randomMoney}$\``,
					)
					.setColor('RED')
					.setFooter({
						text: 'La próxima puede salir bien!',
						iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
					})
					.setTimestamp()
				await a.addUser(interaction.member.id)
				return interaction.reply({ embeds: [embedLose] })
			}
		}
	},
}

module.exports = command
