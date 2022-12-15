const { MessageActionRow, MessageButton } = require('discord.js-light'),
	paginationComponent = new MessageActionRow().addComponents(
		new MessageButton().setStyle('SECONDARY').setCustomId('first').setEmoji('⏪'),
		new MessageButton().setStyle('SECONDARY').setEmoji('◀️').setCustomId('previous'),
		new MessageButton().setCustomId('next').setStyle('SECONDARY').setEmoji('▶️'),
		new MessageButton().setEmoji('⏩').setStyle('SECONDARY').setCustomId('last'),
	)

module.exports = pagination

/**
 * Es importante que pongas como propiedad del embed original `fetchReply: true` para que funcione correctamente
 * @param {CommandInteraction} interaction La interacción con la cuál se hará la paginación
 * @param {MessageEmbed[]} embeds Array contenedor con los mensajes embed
 * @param {number | null} position La posición que se mostrará al inicio
 * @param {number | null} time Segundos para que finalice la paginación
 */

async function pagination(interaction, embeds, position = 0, userId, time = 60 * 1000) {
	const { components } = paginationComponent
	const id = userId || interaction.user.id
	let pos = position
	console.log(pos)
	if (!interaction || !embeds) throw new Error('[pagination] Faltan parametros')
	if (!embeds[1]) throw new Error('[pagination] Se deben poner por lo menos dos embeds')
	if (pos > embeds.length - 1)
		throw new Error(`[pagination] Los embeds no tienen la posición ${pos}`)
	if (pos === 0) components[0].setDisabled(true) && components[1].setDisabled(true)
	if (pos === embeds.length - 1)
		components[2].setDisabled(true) && components[3].setDisabled(true)

	interaction
		.reply({
			embeds: [embeds[position]],
			components: [paginationComponent],
			fetchReply: true,
		})
		.then((msg) => {
			/**
			 * @type {InteractionCollector}
			 */
			const collector = msg.createMessageComponentCollector({ time })

			collector.on('collect', (i) => {
				if (i.user.id !== id) {
					i.reply({
						content: 'Esta interacción no es para ti',
						ephemeral: true,
					})
				} else {
					collector.resetTimer()
					if (i.customId == 'first') pos = 0
					else if (i.customId == 'previous') pos -= 1
					else if (i.customId == 'next') pos += 1
					else pos = embeds.length - 1

					if (pos === 0)
						components[0].setDisabled(true) && components[1].setDisabled(true)
					if (pos === embeds.length - 1)
						components[2].setDisabled(true) && components[3].setDisabled(true)
					if (pos !== embeds.length - 1 && components[2].disabled == true) {
						components[2].setDisabled(false) &&
							components[3].setDisabled(false)
					}
					if (pos !== 0 && components[0].disabled === true) {
						components[0].setDisabled(false) &&
							components[1].setDisabled(false)
					}

					i.deferUpdate()
					interaction.editReply({
						embeds: [embeds[position]],
						components: [paginationComponent],
					})
				}
			})

			collector.on('end', () => {
				components.forEach((component) => component.setDisabled(true))

				interaction.editReply({
					components: [paginationComponent],
					content: 'Botones expirados',
				})
			})
		})
}
