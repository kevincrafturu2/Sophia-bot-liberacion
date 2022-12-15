class PPT {
	constructor({
		options = {
			arrayOptions: ['rock', 'paper', 'scissors'],
		},
	} = {}) {
		this.options = options
	}

	evaluate(target1, target2) {
		if (target1 == this.arrayOptions[0] && target2 == this.arrayOptions[2])
			return 'First player win'
		else if (target2 == this.arrayOptions[0] && target1 == this.arrayOptions[2])
			return 'Second player win'
		else if (target1 == this.arrayOptions[1] && target2 == this.arrayOptions[0])
			return 'First player win'
		else if (target2 == this.arrayOptions[1] && target1 == this.arrayOptions[0])
			return 'Second player win'
		else if (target1 == this.arrayOptions[2] && target2 == this.arrayOptions[1])
			return 'First player win'
		else if (target2 == this.arrayOptions[2] && target1 == this.arrayOptions[1])
			return 'Second player win'
		else return 'draw'
	}
}

module.exports = PPT
