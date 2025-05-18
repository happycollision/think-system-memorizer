<script lang="ts">
	import type { CardStore } from '$lib/cardStore.svelte';
	import Card from './Card.svelte';
	import Swiper, { SwiperSlide } from './Swiper.svelte';

	type Props = {
		cardStore: CardStore;
	};

	let { cardStore }: Props = $props();

	class CardsController {
		#store: CardStore;
		#sequenceStep = 0;
		constructor(store: CardStore) {
			this.#store = store;
		}

		resetMemorize() {
			this.#store.unFlipAll();
			this.#store.goToCard(this.#store.currentCardIndex - 2);
			this.#sequenceStep = 0;
		}

		sequentialMemorize() {
			this.#sequenceStep++;
			if (this.#sequenceStep === 8) {
				this.resetMemorize();
				return;
			}
			if (this.#store.currentCardIsLastCard && this.#store.currentCard.isFlipped) {
				this.resetMemorize();
				return;
			}
			switch (this.#sequenceStep % 2 === 1) {
				case true:
					this.#store.flipCard();
					break;
				case false:
					this.#store.nextCard();
					break;
			}
		}
	}
	const controller = new CardsController(cardStore);
</script>

<div class="flex h-[calc(100dvh-100px)] flex-col">
	<Swiper
		slideIndex={cardStore.currentCardIndex}
		onSlideChange={(idx) => {
			cardStore.goToCard(idx);
		}}
	>
		{#each cardStore.cards as { front, back, isFlipped }, i (i)}
			<SwiperSlide>
				<div class="h-full p-4">
					<Card {front} {back} {isFlipped} flipCard={() => cardStore.flipCard(i)} />
				</div>
			</SwiperSlide>
		{/each}
	</Swiper>

	<div class="flex justify-between gap-4">
		<button
			type="button"
			class="btn"
			onclick={() => {
				if (cardStore.currentCard.isFlipped) {
					cardStore.flipCard();
				} else {
					cardStore.previousCard();
				}
			}}
			disabled={!cardStore.currentCard.isFlipped && cardStore.currentCardIsFirstCard}
		>
			Previous
		</button>
		<button
			type="button"
			class="btn"
			onclick={() => {
				controller.sequentialMemorize();
			}}
		>
			Memorize
		</button>
		<button
			type="button"
			class="btn"
			onclick={() => {
				if (!cardStore.currentCard.isFlipped) {
					cardStore.flipCard();
				} else {
					cardStore.nextCard();
				}
			}}
			disabled={cardStore.currentCard.isFlipped && cardStore.currentCardIsLastCard}
		>
			Next
		</button>
	</div>
</div>
