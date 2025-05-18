<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { CardStore } from '$lib/cardStore.svelte';
	import { makeParts } from '$lib/textInterpreter';
	import Cards from './Cards.svelte';
	import Script from './Script.svelte';

	let title = $derived(page.params.title);

	let text = $derived(await fetch(`${base}/files/${title}.txt`).then((res) => res.text()));

	let cards = $state(true);

	const textParts = $derived(makeParts(text));
	const cardStore = $derived(
		new CardStore(textParts.map(([front, back]) => ({ front, back, isFlipped: false })))
	);

	function changeViewAtIndex(index: number) {
		cardStore.goToCard(index);
		cardStore.unFlipAll();
		cards = !cards;
	}
</script>

<div class="flex justify-between">
	<a class="btn" href="/">Back <span class="sr-only sm:not-sr-only">to libretto list</span></a>
	<header class="flex flex-wrap items-center justify-center gap-x-4">
		<h1 class="text-xl">
			{title}
		</h1>
		{cardStore.currentCardIndex + 1} / {cardStore.cards.length}
	</header>
	<button class="btn" onclick={() => (cards = !cards)}>View as {cards ? 'script' : 'cards'}</button>
</div>

{#if cards}
	<Cards {cardStore} />
{:else}
	<div class="m-auto mt-8 max-w-[70ch] text-lg">
		<Script {text} startingIndex={cardStore.currentCardIndex} {changeViewAtIndex} />
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
