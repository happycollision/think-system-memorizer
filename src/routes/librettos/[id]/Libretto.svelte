<script lang="ts">
	import { makeParts } from '$lib/textInterpreter';

	type Props = {
		text: string;
		startingIndex: number;
		changeViewAtIndex: (index: number) => void;
	};

	let { text, startingIndex, changeViewAtIndex }: Props = $props();

	const textParts = makeParts(text);

	$effect(function scrollToStart() {
		if (startingIndex) {
			const card = document.getElementById(`card-${startingIndex}`);
			if (card) {
				card.scrollIntoView();
			}
		}
	});
</script>

<div>
	{#each textParts as [front, back], i (i)}
		<button
			onclick={() => changeViewAtIndex(i)}
			id={`card-${i}`}
			class="-m-1 block w-full rounded p-1 text-left hover:bg-gray-100/50 dark:hover:bg-gray-800/80"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html front}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html back}
		</button>
	{/each}
</div>

<style lang="postcss">
	@reference '../../../app.css';
	div :global .highlighted .dialogue {
		@apply highlight;
	}
</style>
