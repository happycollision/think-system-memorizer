<script lang="ts">
	import { CardStore } from '$lib/cardStore.svelte';
	import { makeParts } from '$lib/textInterpreter';
	import Cards from './Cards.svelte';
	import Header from './Header.svelte';
	import Libretto from './Libretto.svelte';
	import type { Libretto as LibrettoType } from '../../api/librettos.json/+server.js';

	type Props = { libretto: LibrettoType };

	const { libretto }: Props = $props();

	let cards = $state(true);

	const textParts = $derived(makeParts(libretto.content));
	const cardStore = $derived(
		new CardStore(textParts.map(([front, back]) => ({ front, back, isFlipped: false })))
	);

	function changeViewAtIndex(index: number) {
		cardStore.goToCard(index);
		cardStore.unFlipAll();
		cards = !cards;
	}
</script>

<Header>
	{#snippet title()}
		{libretto.title}
	{/snippet}
	{#snippet location()}
		{cardStore.currentCardIndex + 1} / {cardStore.cards.length}
	{/snippet}

	<button class="btn" onclick={() => (cards = !cards)}>View as {cards ? 'script' : 'cards'}</button>
</Header>

{#if cards}
	<Cards {cardStore} />
{:else}
	<div class="m-auto mt-8 max-w-[70ch] text-lg">
		<Libretto
			text={libretto.content}
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
