import { browser } from '$app/environment';
import { goto, replaceState } from '$app/navigation';
import { page } from '$app/state';
import type { Component as SvelteComponent } from 'svelte';

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
	#cardViaPage = $derived.by(() => {
		if (!browser) return 0;
		if (page.state.card) return page.state.card as number;
		return Number(page.url.searchParams.get('card') || '0');
	});
	#currentCardIndex = $derived.by(() => {
		const incoming = this.#cardViaPage - 1;
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

	private getNewUrlForIdx(idx: number) {
		if (!browser) return '';
		const url = new URL(page.url.href);
		url.searchParams.set('card', (idx + 1).toString());
		return url;
	}

	private setUrlFromIdx(idx: number) {
		if (!browser) return;
		replaceState(this.getNewUrlForIdx(idx), { card: idx + 1 });
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
		this.setUrlFromIdx(index);
		if (opts?.hardNav && browser) {
			// Ugh this is terribly entangled. We have to do this because on the fountain script view, we cannot get the scrolling to work properly.
			document.getElementById(`card-${index + 1}`)?.scrollIntoView();
		}
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
