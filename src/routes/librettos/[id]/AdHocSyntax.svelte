<script lang="ts">
	import { CardStore } from '$lib/cardStore.svelte';
	import { makeParts } from '$lib/textInterpreter';
	import Cards from './Cards.svelte';
	import Header from './Header.svelte';
	import Libretto from './Libretto.svelte';
	import type { Libretto as LibrettoType } from '../../api/librettos.json/+server.js';
	import CardFaceRawHtml from './CardFaceRawHTML.svelte';

	type Props = { libretto: LibrettoType };

	const { libretto }: Props = $props();

	let cards = $state(true);

	const textParts = $derived(makeParts(libretto.content));
	const cardStore = $derived(
		new CardStore<string>(
			textParts.map(([front, back]) => ({ front, back, isFlipped: false })),
			CardFaceRawHtml,
		),
	);

	function changeViewAtIndex(index: number) {
		cardStore.goToCard(index);
		cardStore.unFlipAll();
		cards = !cards;
	}
</script>

<Header
	{libretto}
	{cardStore}
	nextView={cards ? 'script' : 'cards'}
	toggleView={() => (cards = !cards)}
/>

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
