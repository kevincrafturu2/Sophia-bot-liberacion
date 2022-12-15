const spaceChar = ''

class MarketGame {
	constructor({
		emojis = {
			food: ['🍌', '🍉', '🍇', '🍋', '🍌', '🍒', '🍍', '🍎'],
			trash: ['🧶', '👞', '🥎', '⚙', '🏈', '⚽', '🏆', '💣'],
		},
		rows = 5,
		columns = 7,
		lives = 3,
	} = {}) {
		this.lives = lives
		this.emojis = emojis
		this.rows = rows
		this.columns = columns
		this.board = []
		this.position = Math.ceil(columns / 2) - 1
		this.collector = {
			unicode: '🛒',
		}
	}

	generateArray() {
		// Genera el array (se debe utilizar justo despues de instanciar)
		for (let i = 0; i < this.rows; i++) {
			this.board[i] = []
			for (let j = 0; j < this.columns; j++) this.board[i][j] = spaceChar
		}
		return this.board
	}

	checkCollectorPosition() {
		// Boolean, Verifica la posicion del collector (carrito)
		const row = this.board.at(-1)
		const emojiIndex = row.findIndex((x) => x !== spaceChar)
		if (emojiIndex === -1) return true
		if (this.position === emojiIndex && this.emojis.trash.includes(row[emojiIndex])) {
			this.lives--
			return false
		}
		if (this.position !== emojiIndex && this.emojis.trash.includes(row[emojiIndex]))
			return true
		if (this.position !== emojiIndex) {
			this.lives--
			return false
		}
		return true
	}

	updateFrame() {
		// Array, actualiza el frame de los emojis
		this.moveEmojis()
		this.generateEmoji()

		return this.board
	}

	nextEmojiInfo() {
		const emoji = this.board.at(-1)[this.position]
		return {
			trash: this.emojis.trash.includes(emoji),
			food: this.emojis.food.includes(emoji),
		}
	}

	moveEmojis() {
		for (let i = this.board.length; i >= 0; i--) {
			if (!this.board[i + 1]) continue
			this.board[i + 1] = [...this.board[i]]
			if (i === 0) this.board[i] = this.board[i].fill(spaceChar)
		}

		return this.board
	}

	generateEmoji() {
		const random = Math.floor(Math.random() * 2)
		const emojiChunk = [[...this.emojis.trash], [...this.emojis.food]][random]
		const emoji = emojiChunk[Math.floor(Math.random() * emojiChunk.length)]
		const position = Math.floor(Math.random() * this.board[0].length)

		this.board[0][position] = emoji
		return this.board
	}

	ascii() {
		// String, retorna una string para verse desde terminal, lo cambias segun lo que quieras poner
		let str = ''

		for (let i = 0; i < this.board.length; i++) {
			str += this.board[i].map((x) => (x === spaceChar ? '*' : x)).join(' ')
			str += '\n'
		}
		str += '=='.repeat(this.columns)
		str += '\n'
		const collectorRow = [...Array(this.columns)].map((_, i) =>
			i === this.position ? this.collector.unicode : '*',
		)
		str += collectorRow.join(' ')
		return str
	}

	moveLeft() {
		// Number, mueve el collector a la izquierda
		if (this.position > 0) this.position--
		return this.position
	}

	moveRight() {
		// Number, mueve el collector a la derecha
		if (this.position < this.columns - 1) this.position++
		return this.position
	}
}

module.exports = MarketGame
