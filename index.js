const Discord = require('discord.js-light')
const { red, blue, green } = require('colors')
const client = new Discord.Client({
	shards: 'auto',
	makeCache: Discord.Options.cacheWithLimits({
		ApplicationCommandManager: 100, // guild.commands
		BaseGuildEmojiManager: 10, // guild.emojis
		ChannelManager: Infinity, // client.channels
		GuildChannelManager: Infinity, // guild.channels
		GuildBanManager: 20, // guild.bans
		GuildInviteManager: 10, // guild.invites
		GuildManager: Infinity, // client.guilds
		GuildMemberManager: 1000, // guild.members
		GuildStickerManager: 0, // guild.stickers
		GuildScheduledEventManager: 0, // guild.scheduledEvents
		MessageManager: Infinity, // channel.messages
		PermissionOverwriteManager: 30, // channel.permissionOverwrites
		PresenceManager: 0, // guild.presences
		ReactionManager: 12, // message.reactions
		ReactionUserManager: 32, // reaction.users
		RoleManager: 100, // guild.roles
		StageInstanceManager: 0, // guild.stageInstances
		ThreadManager: 0, // channel.threads
		ThreadMemberManager: 0, // threadchannel.members
		UserManager: Infinity, // client.users
		VoiceStateManager: 0, // guild.voiceStates
	}),
	intents: [130815],
})

const fs = require('fs')
const toml = require('toml')
const config = toml.parse(fs.readFileSync('./config/config.toml', 'utf-8'))
const token = config.token
const { DiscordTogether } = require('discord-together')
const mongoose = require('mongoose')

const { cacheManager, cacheManagerDatabase } = require('./cacheManager')
client.super = {
	cache: new cacheManager(), // Caché para datos útiles.
}
client.database = {
	guilds: new cacheManagerDatabase(client, 'g'), // Caché para servidores.
	users: new cacheManagerDatabase(client, 'u'), // Caché para usuarios.
}

client.discordTogether = new DiscordTogether(client)
client.queue = new Map()
client.language = new Discord.Collection()
module.exports = client

client.sc = new Discord.Collection()
;['event'].forEach((handler) => {
	require(`./handlers/${handler}`)(client)
})

require('./handlers/language')(client)
mongoose
	.connect(config.MongoDB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log(green('conectado a MongoDB'))
	})
	.catch((err) => {
		console.log(red(err))
	})
const { GiveawaysManager } = require('discord-giveaways')
const manager = new GiveawaysManager(client, {
	storage: './config/giveaways.json',
	default: {
		botsCanWin: false,
		embedColor: '#00FFFF',
		embedColorEnd: 'RED',
		reaction: '🎉',
	},
})

client.giveawaysManager = manager

const slashcommandsFiles = fs.readdirSync('./slashcommands')
for (const folder of slashcommandsFiles) {
	for (const cmd of fs
		.readdirSync(`./slashcommands/${folder}/`)
		.filter((f) => f.endsWith('.js'))) {
		const slash = require(`./slashcommands/${folder}/${cmd}`)
		if (slash.data) client.sc.set(slash.data.name, slash)
		else console.log(blue(`Comando (/) - ${cmd} no fue cargado`))
	}
	console.log(green(`${client.sc.size} comandos cargados en total.`))
}

process.on('unhandledRejection', (err) => {
	console.log(red('Al parecer hubo un unhandledRejection. \n' + err.stack))
})
process.on('uncaughtException', (err) => {
	console.log('PROCESO uncaughtException: ', err)
})
process.on('exit', (code) => {
	console.log('PROCESO EXIT: ', code)
})
client.on('Error', (err) => {
	console.log(red('Al parecer hubo un error. \n' + err.stack))
})
client.on('Warn', (err) => {
	console.log(red('Al parecer hubo una advertencia. \n' + err.stack))
})
client.on('shardConnect', async (shardId, guilds) => {
	console.log(
		'Shard num ' + shardId + ': LANZADO PARA ' + guilds.length + ' SERVIDORES.',
	)
})
client.on('shardDisconnect', (shard) => {
	console.log('Shard Desconectada: ' + shard)
})
client.on('shardError', (shard) => {
	console.log('Error en Shard: ' + shard)
})
client.on('shardReady', (shard) => {
	console.log('Shard Lista: ' + shard)
})
client.on('shardReconnecting', (shard) => {
	console.log('Shard Reconectada: ' + shard)
})
client.on('shardResume', (shard) => {
	console.log('Shard Restaurada: ' + shard)
})

client.login(token)
