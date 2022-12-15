const client = require('../index.js')
const { MessageEmbed } = require('discord.js-light')
const schema = require('../models/setLeave')
const schema2 = require('../models/components-leave')

client.on('guildMemberRemove', async (member) => {
	const ch = await schema.findOne({ ServerID: member.guild.id })
	const components = await schema2.findOne({ ServerID: member.guild.id })

	if (ch && ch.ChannelID) {
		try {
			const channel = member.guild.channels.cache.get(ch.ChannelID)
			const goodbye = new MessageEmbed().setColor('ORANGE')

			if (components) {
				goodbye.setTitle(
					components.Title.replaceAll('{member.username}', member.user.username)
						.replaceAll('{member.tag}', member.user.tag)
						.replaceAll('{server}', member.guild.name),
				)
				goodbye.setDescription(
					components.Description.replaceAll(
						'{member.username}',
						member.user.username,
					)
						.replaceAll('{member.tag}', member.user.tag)
						.replaceAll('{server}', member.guild.name)
						.replaceAll('{membersTotal}', member.guild.memberCount)
						.replaceAll('{member}', member.user),
				)
				goodbye.setFooter(
					components.Footer.replaceAll(
						'{member.username}',
						member.user.username,
					)
						.replaceAll('{server}', member.guild.name)
						.replaceAll('{membersTotal}', member.guild.memberCount),
				)
			} else {
				goodbye.setTitle('🛫 Adíos!')
				goodbye.setDescription(`<@${member.id}> Ha abandonado el servidor :weary:\n
                Ahora somos: **${member.guild.memberCount}** Miembros!`)
			}
			channel.send({ embeds: [goodbye] })
		} catch (err) {
			console.log(err)
		}
	} else {
		return
	}
})
