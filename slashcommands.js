const fs = require('fs')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v10')
const toml = require('toml')
const config = toml.parse(fs.readFileSync('./config/config.toml', 'utf-8'))
const { token, botId /* , supportID*/ } = config
const commands = []
const privateCommands = []
const slashcommandsFiles = fs.readdirSync('./slashcommands')
const { green } = require('colors')

for (const folder of slashcommandsFiles) {
	const Folder = fs
		.readdirSync(`./slashcommands/${folder}/`)
		.filter((file) => file.endsWith('js'))
	for (const cmd of Folder) {
		const slash = require(`./slashcommands/${folder}/${cmd}`)
		if (Folder == 'private') privateCommands.push(slash.data.toJSON())
		else commands.push(slash.data.toJSON())
	}
}

const rest = new REST({ version: '10' }).setToken(token)

createSlash()

async function createSlash() {
	try {
		await rest.put(Routes.applicationCommands(botId), {
			body: commands,
		})
		/* await rest.put(Routes.applicationGuildCommands(botId, supportID), {
			body: privateCommands,
		})*/
		console.log(green('[command] Comandos privados cargados.'))
		console.log(green('[command] Comandos cargados.'))
	} catch (e) {
		console.log(e)
	}
}
