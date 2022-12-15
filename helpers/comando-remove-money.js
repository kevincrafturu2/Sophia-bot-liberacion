const schema = require('../models/economy-model.js')
async function remove(guildid, userid, amount) {
	const results = await schema.findOne({ guildid, userid })
	if (results) {
		const money = parseInt(results.money) - parseInt(amount)
		await schema.updateOne({ guildid, userid }, { money })
	} else {
		const newMoney = new schema({
			guildid,
			userid,
			money: -amount,
		})
		await newMoney.save()
	}
	return
}

module.exports = remove
