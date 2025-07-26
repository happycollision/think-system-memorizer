import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import type { Component as SvelteComponent } from 'svelte';

type Card<T> = {
	front: T;
	back: T;
	isFlipped: boolean;
};

export class CardStore<T = unknown> {
	#cards: Card<T>[] = $state([]);
	#currentCardIndex = $derived.by(() => {
		const incoming = Number(page.url.searchParams.get('card') || '0') - 1;
		let idx = incoming;
		if (idx < 0) {
			idx = 0;
		}
		if (idx >= this.#cards.length) {
			idx = this.#cards.length - 1;
		}
		// Fix the URL if necessary
		if (incoming !== idx && browser) goto(this.getNewUrlForIdx(idx));

		return idx;
	});

	Component: SvelteComponent<{ content: T }>;

	constructor(cards: Card<T>[], component: typeof this.Component) {
		this.#cards = cards;
		this.Component = component;
	}

	getNewUrlForIdx(idx: number) {
		if (!browser) return '';
		const url = new URL(page.url.href);
		url.searchParams.set('card', (idx + 1).toString());
		return url;
	}

	setUrlFromIdx(idx: number) {
		if (!browser) return;
		goto(this.getNewUrlForIdx(idx), { noScroll: true, replaceState: true });
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
		if (index === this.#currentCardIndex) return;
		this.setUrlFromIdx(index);
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
