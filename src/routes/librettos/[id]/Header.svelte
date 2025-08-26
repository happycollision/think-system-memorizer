<script module lang="ts">
	const HEADER_PADDING = 8;

	export function getHeaderHeightAndPadding() {
		const headerHeight = getComputedStyle(document.documentElement).getPropertyValue(
			'--header-height',
		);
		return (Number(headerHeight.replace('px', '')) || 0) + HEADER_PADDING;
	}
</script>

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

	let nextValue = $derived(cardStore.currentCardIndex + 1);
</script>

<div
	{@attach (el) => {
		const style = document.createElement('style');
		style.innerHTML = `
  body * {
    scroll-margin-top: calc(var(--header-height, 0) * 1px + ${HEADER_PADDING}px);
  }
`;
		document.head.appendChild(style);

		const updateHeaderHeight = () => {
			document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}`);
		};
		updateHeaderHeight();
		window.addEventListener('resize', updateHeaderHeight);

		return () => {
			window.removeEventListener('resize', updateHeaderHeight);
			style.remove();
		};
	}}
	class="sticky top-0 isolate z-10 bg-gray-200 dark:bg-gray-800"
>
	<div class="flex justify-between gap-2 p-2">
		<a class="btn" href="{base}/librettos/">
			<span>Back <span class="sr-only sm:not-sr-only">to libretto list</span></span>
		</a>
		<header class="flex flex-wrap items-center justify-center gap-x-4">
			<h1 class="text-xl">
				{libretto.title}
			</h1>
			{nextValue} / {cardStore.cards.length}
		</header>
		<button class="btn" onclick={toggleView}>View as {nextView}</button>
	</div>
	<input
		class="w-full"
		type="range"
		step="1"
		value={cardStore.currentCardIndex + 1}
		oninput={(ev) => (nextValue = Number(ev.currentTarget.value))}
		onchange={(ev) => cardStore.goToCard(Number(ev.currentTarget.value) - 1, { hardNav: true })}
		max={cardStore.cards.length}
		min="1"
	/>
</div>
