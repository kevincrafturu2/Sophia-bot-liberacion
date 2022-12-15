const client = require('../index')
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js-light')
const { getChannelVideos } = require('yt-channel-info')
const db = require('../models/yt-system')
const { bgRed, white } = require('colors')

client.on('ready', async () => {
	console.log(bgRed(white('Sistema alertas YT - Cargado...')))

	setInterval(async () => {
		db.find({}, async (err, docs) => {
			if (err)
				throw err

			if (docs) {
				docs.forEach(async (doc) => {
					const videos = await getChannelVideos({
						channelId: `${doc.ChannelYTID}`,
						channelIdType: 0,
					})

					if (videos.length <= 0)
						return

					const lastVideo = videos.items[0]
					const lastVideoID = lastVideo.videoId

					if (doc.VideoID !== lastVideoID) {
						doc.VideoID = lastVideoID
						doc.save()
						const row = new MessageActionRow().addComponents(
							new MessageButton()
								.setLabel('Click para abrir video.')
								.setStyle('LINK')
								.setURL(`https://www.youtube.com/watch?v=${lastVideoID}`),
						)

						client.channels.cache.get(doc.ChannelID).send({ content: doc.everyone ? '@everyone' : null, embeds: [
							new MessageEmbed()
								.setTitle(`**${lastVideo.author}** ha subido un nuevo video!\n**${lastVideo.title}**`)
								.setURL(`https://www.youtube.com/watch?v=${lastVideoID}`)
								.setColor('#ff0000')
								.setImage(lastVideo.videoThumbnails[3].url),
						], components: [row] })
					}

				})
			}
		})
	}, 10000)
})
/*
ya? yep
dejame probar cosas a mi
*/
