const client = require('../index')
const { cyan, yellow } = require('colors')

client.once('ready', async () => {
	console.log(
		`cliente listo en: ${cyan(`${client.user.tag}`)}` +
			'\n' +
			cyan(`
░██████╗░█████╗░██████╗░██╗░░██╗██╗░█████╗░
██╔════╝██╔══██╗██╔══██╗██║░░██║██║██╔══██╗
╚█████╗░██║░░██║██████╔╝███████║██║███████║
░╚═══██╗██║░░██║██╔═══╝░██╔══██║██║██╔══██║
██████╔╝╚█████╔╝██║░░░░░██║░░██║██║██║░░██║
╚═════╝░░╚════╝░╚═╝░░░░░╚═╝░░╚═╝╚═╝╚═╝░░╚═╝`),
	)

	const AutoPresence = () => {
		const status = {
			activities: [
				'/help',
				'/invite',
				'¡SOPHIA 3.1.4!',
				`${client.guilds.cache.size} servidores.`,
				`${client.guilds.cache.reduce(
					(prev, guild) => prev + guild.memberCount,
					0,
				)} Usuarios.`,
				'Unifyware Association.',
			],
			activity_types: ['WATCHING', 'PLAYING', 'LISTENING', 'COMPETING'],
		}

		const aleanum = Math.floor(Math.random() * status.activities.length)
		client.user.setPresence({
			activities: [
				{
					name: status.activities[aleanum],
					type: status.activity_types[aleanum],
				},
			],
		})
	}

	setInterval(() => {
		AutoPresence()
	}, 60000)

	client.super.cache.purgeAll()

	console.log(yellow('Presencia del bot cargada exitosamente.'))
})