<script lang="ts">
	import { base } from '$app/paths';
	import { CardStore } from '$lib/cardStore.svelte';
	import { makeParts } from '$lib/textInterpreter';
	import Cards from './Cards.svelte';
	import Libretto from './Libretto.svelte';

	const { data } = $props();

	let cards = $state(true);

	const textParts = $derived(makeParts(data.libretto.content));
	const cardStore = $derived(
		new CardStore(textParts.map(([front, back]) => ({ front, back, isFlipped: false })))
	);

	function changeViewAtIndex(index: number) {
		cardStore.goToCard(index);
		cardStore.unFlipAll();
		cards = !cards;
	}
</script>

<div class="flex justify-between gap-2 p-2">
	<a class="btn" href="{base}/librettos/">
		<span>Back <span class="sr-only sm:not-sr-only">to libretto list</span></span>
	</a>
	<header class="flex flex-wrap items-center justify-center gap-x-4">
		<h1 class="text-xl">
			{data.libretto.title}
		</h1>
		{cardStore.currentCardIndex + 1} / {cardStore.cards.length}
	</header>
	<button class="btn" onclick={() => (cards = !cards)}>View as {cards ? 'script' : 'cards'}</button>
</div>

{#if cards}
	<Cards {cardStore} />
{:else}
	<div class="m-auto mt-8 max-w-[70ch] text-lg">
		<Libretto
			text={data.libretto.content}
			startingIndex={cardStore.currentCardIndex}
			{changeViewAtIndex}
		/>
	</div>
{/if}

<style lang="postcss">
	@reference 'tailwindcss';
	:global .stage-directions {
		@apply ml-4 block italic opacity-50;
	}
	:global .character {
		@apply mt-4 block font-bold;
	}
</style>
