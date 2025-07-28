import { browser } from '$app/environment';
import type { Component as SvelteComponent } from 'svelte';
import { navState } from './nav.extension.svelte';

type Card<T> = {
	front: T;
	back: T;
	isFlipped: boolean;
};

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace App {
		interface PageState {
			card?: number;
		}
	}
}

export class CardStore<T = unknown> {
	#cards: Card<T>[] = $state([]);
	#currentCardIndex = $derived.by(() => {
		const incoming = navState.card - 1;
		let idx = incoming;
		if (idx < 0) {
			idx = 0;
		}
		if (idx >= this.#cards.length) {
			idx = this.#cards.length - 1;
		}
		// Fix the URL if necessary
		if (incoming !== idx && browser) navState.setCard(idx + 1);

		return idx;
	});

	Component: SvelteComponent<{ content: T }>;

	constructor(cards: Card<T>[], component: typeof this.Component) {
		this.#cards = cards;
		this.Component = component;
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

	goToCard(index: number, opts?: { hardNav?: boolean }) {
		if (index === this.#currentCardIndex) return;
		navState.setCard(index + 1, opts?.hardNav ? 'scroll' : undefined);
	}

	flipCard(index = this.#currentCardIndex) {
		this.#cards[index].isFlipped = !this.#cards[index].isFlipped;
	}

	nextCard() {
		if (this.#currentCardIndex < this.#cards.length - 1) {
			this.goToCard(this.#currentCardIndex + 1);
		}
	}

	previousCard() {
		if (this.#currentCardIndex > 0) {
			this.goToCard(this.#currentCardIndex - 1);
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
