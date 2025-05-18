type Card = {
	front: string;
	back: string;
	isFlipped: boolean;
};

export class CardStore {
	#cards: Card[] = $state([]);
	#currentCardIndex = $state(0);

	constructor(cards: Card[]) {
		this.#cards = cards;
	}

	get cards() {
		return this.#cards;
	}

	get currentCardIndex() {
		return this.#currentCardIndex;
	}

	get currentCard() {
		return this.#cards[this.#currentCardIndex];
	}

	get currentCardIsLastCard() {
		return this.#currentCardIndex === this.#cards.length - 1;
	}

	get currentCardIsFirstCard() {
		return this.#currentCardIndex === 0;
	}

	goToCard(index: number) {
		this.#currentCardIndex = index;
	}

	flipCard(index = this.#currentCardIndex) {
		this.#cards[index].isFlipped = !this.#cards[index].isFlipped;
	}

	nextCard() {
		if (this.#currentCardIndex < this.#cards.length - 1) {
			this.#currentCardIndex++;
		}
	}

	previousCard() {
		if (this.#currentCardIndex > 0) {
			this.#currentCardIndex--;
		}
	}

	nextState() {
		if (this.currentCard.isFlipped) {
			this.nextCard();
		} else {
			this.flipCard();
		}
	}

	unFlipAll() {
		this.#cards.forEach((card) => {
			card.isFlipped = false;
		});
	}
}
