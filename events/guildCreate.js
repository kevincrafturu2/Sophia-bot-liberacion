const client = require('../index.js')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js-light')
const fs = require('fs')
const toml = require('toml')
const config = toml.parse(fs.readFileSync('./config/config.toml', 'utf-8'))
client.on('guildCreate', async (guild) => {
	const serverID = config.serverID

	const Embed = new MessageEmbed()
		.setTitle('Gracias por agregarme!')
		.setDescription(
			'Estoy contenta de poder estar aqui, espero ser de mucha ayuda para tu servidor y que puedas disfrútar todo lo que tengo para ofrecer.\n\nRecuerda que me puede apoyar dando click en los botones de abajo, donde esta la bot-list y el servidor de soporte!',
		)
		.setFooter({ text: 'Disfruta!!!' })
		.setColor('#00FFFF')

	const row = new MessageActionRow().addComponents(
		new MessageButton()
			.setLabel('Vota por mi!')
			.setStyle('LINK')
			.setURL('https://discordbotlist.com/bots/sophia-8660'),

		new MessageButton()
			.setLabel('Servidor Soporte.')
			.setStyle('LINK')
			.setURL('https://discord.gg/QaY43QSDwK'),
	)

	const channelWelcome = guild.channels.cache.find((ch) => ch.name === '🎀--sophia')
	if (!channelWelcome) {
		guild.channels
			.create('🎀 | Sophia', 'text')
			.then((c) => c.send({ embeds: [Embed], components: [row] }))
	} else {
		channelWelcome.send({ embeds: [Embed], components: [row] })
	}

	const own = await client.users.fetch(guild.ownerId)

	const llegue = new MessageEmbed()
		.setTitle('✨ Entre a un nuevo servidor!')
		.addField('ℹ Nombre del servidor:', `${guild.name}`, true)
		.addField('🧒 Actualmente tiene:', `${guild.memberCount} usuarios.`)
		.addField('ℹ ID del servidor:', `${guild.id}`, true)
		.addField('🌐 Owner:', `${own.tag}`, true)
		.addField('🎀 Estoy actualmente en:', `${client.guilds.cache.size} servidores.`)
		.setThumbnail(guild.iconURL({ dynamic: true }))
		.setColor('LUMINOUS_VIVID_PINK')

	client.channels.cache.get(serverID).send({ embeds: [llegue] })

	const server = client.guilds.cache.get(config.supportID)
	const usu = await server.members.fetch(own.id)

	usu.roles.add(config.rolID).catch(console.log)
})
