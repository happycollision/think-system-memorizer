<script lang="ts">
	import { base } from '$app/paths';
	import type { Libretto } from '../../api/librettos.json/+server';
	import type { CardStore } from '$lib/cardStore.svelte';

	type Props = {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		cardStore: CardStore<any>;
		libretto: Libretto;
		nextView: 'cards' | 'script';
		toggleView: () => void;
	};

	const { libretto, cardStore, nextView, toggleView }: Props = $props();
</script>

<div class="flex justify-between gap-2 p-2">
	<a class="btn" href="{base}/librettos/">
		<span>Back <span class="sr-only sm:not-sr-only">to libretto list</span></span>
	</a>
	<header class="flex flex-wrap items-center justify-center gap-x-4">
		<h1 class="text-xl">
			{libretto.title}
		</h1>
		{cardStore.currentCardIndex + 1} / {cardStore.cards.length}
	</header>
	<button class="btn" onclick={toggleView}>View as {nextView}</button>
</div>
