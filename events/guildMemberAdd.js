const client = require('../index.js')
const { MessageEmbed } = require('discord.js-light')
const schema = require('../models/setWelcome.js')
const schema2 = require('../models/components-welcome')

client.on('guildMemberAdd', async (member) => {
	const ch = await schema.findOne({ ServerID: member.guild.id })
	const components = await schema2.findOne({ ServerID: member.guild.id })

	if (ch && ch.ChannelID) {
		try {
			const channel = member.guild.channels.cache.get(ch.ChannelID)
			const welcome = new MessageEmbed().setColor('RANDOM')

			if (components) {
				welcome.setTitle(
					components.Title.replaceAll('{member.username}', member.user.username)
						.replaceAll('{member.tag}', member.user.tag)
						.replaceAll('{server}', member.guild.name),
				)
				welcome.setDescription(
					components.Description.replaceAll(
						'{member.username}',
						member.user.username,
					)
						.replaceAll('{member.tag}', member.user.tag)
						.replaceAll('{server}', member.guild.name)
						.replaceAll('{membersTotal}', member.guild.memberCount)
						.replaceAll('{member}', member.user),
				)
				welcome.setFooter(
					components.Footer.replaceAll(
						'{member.username}',
						member.user.username,
					)
						.replaceAll('{server}', member.guild.name)
						.replaceAll('{membersTotal}', member.guild.memberCount),
				)
				welcome.setImage(
					`https://api.popcat.xyz/welcomecard?background=${
						components.Imagen
					}&text1=${member.user.username}&text2=Bienvenido+a+${
						member.guild.name
					}&text3=Pasalo+bien!&avatar=${member.user.displayAvatarURL({
						format: 'png',
						dinamyc: false,
					})}`
						.trim()
						.split(/ +/)
						.join('+'),
				)
			} else {
				welcome.setTitle('🛬 Nuevo Miembro!')
				welcome.setDescription(`Bienvenido! <@${member.id}> a ${member.guild.name}!\n
                Ahora en total somos: **${member.guild.memberCount}** Miembros! Que felicidad.`)
				welcome.setImage(
					`https://api.popcat.xyz/welcomecard?background=${member.guild.iconURL(
						{ dynamic: false, format: 'png' },
					)}&text1=${member.user.username}&text2=Bienvenido+a+${
						member.guild.name
					}&text3=Pasalo+bien!&avatar=${member.user.displayAvatarURL({
						format: 'png',
						dinamyc: false,
					})}`
						.trim()
						.split(/ +/)
						.join('+'),
				)
			}
			channel.send({ content: `${member.user}`, embeds: [welcome] })
		} catch (err) {
			console.log(err)
		}
	} else {
		return
	}
})
