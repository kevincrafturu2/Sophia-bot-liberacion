/* eslint-disable no-shadow */
const { SlashCommandBuilder } = require('@discordjs/builders')

/**
 * @type {import('../../types/typeslash').Command}
 */

const command = {
	userPerms: ['MANAGE_GUILD'],
	botPerms: ['MANAGE_GUILD'],
	category: 'Configuración',
	isMaintenance: true,

	data: new SlashCommandBuilder()
		.setName('setmodlogs')
		.setDescription('Establece los logs del bot.')
		.addSubcommandGroup((o) =>
			o
				.setName('activar')
				.setDescription('Establece un mod log de tu servidor.')
				.addSubcommand((o) =>
					o
						.setName('mensajes-eliminados')
						.setDescription(
							'Si alguien elimina un mensaje, el bot lo mandará',
						),
				)
				.addSubcommand((o) =>
					o
						.setName('mensajes-editados')
						.setDescription('Si alguien edita un mensaje, el bot lo mandará'),
				)
				.addSubcommand((o) =>
					o
						.setName('nuevo-ban')
						.setDescription('Revisa quien realizo un ban, cuando y a quien.'),
				)
				.addSubcommand((o) =>
					o
						.setName('nuevo-rol')
						.setDescription('Revisa quien creo un rol y cuando lo creo'),
				)
				.addSubcommand((o) =>
					o
						.setName('canal-editado')
						.setDescription(
							'Revisa quien cambio el nombre a un canal o edito permisos.',
						),
				)
				.addSubcommand((o) =>
					o
						.setName('servidor-editado')
						.setDescription(
							'Revisa quien cambio el nombre a un canal o edito permisos.',
						),
				),
		)
		.addSubcommandGroup((o) =>
			o
				.setName('desactivar')
				.setDescription('Desactiva algún log.')
				.addSubcommand((o) =>
					o.setName('mensajes-eliminados').setDescription('desactivar'),
				)
				.addSubcommand((o) =>
					o.setName('mensajes-editados').setDescription('desactivar'),
				)
				.addSubcommand((o) => o.setName('nuevo-ban').setDescription('desactivar'))
				.addSubcommand((o) => o.setName('nuevo-rol').setDescription('desactivar'))
				.addSubcommand((o) =>
					o.setName('canal-editado').setDescription('desactivar'),
				)
				.addSubcommand((o) =>
					o.setName('servidor-editado').setDescription('desactivar'),
				),
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 */

	// eslint-disable-next-line no-unused-vars
	async run(client, interaction) {
		// Codigo sin hacer
	},
}

module.exports = command
