<script lang="ts">
	import { characterMatch } from '$lib/characterMatch';
	import { FountainParser, type SceneElement } from '../../../fountain-parser';
	import type { Libretto } from '../../api/librettos.json/+server';
	import Fountain from './Fountain.svelte';
	import Header from './Header.svelte';
	import { CardStore } from '$lib/cardStore.svelte';
	import CardFaceSceneElements from './CardFaceSceneElements.svelte';
	import Cards from './Cards.svelte';

	type Props = {
		libretto: Libretto;
	};

	let { libretto }: Props = $props();
	let cards = $state(false);

	let parsed = $derived(new FountainParser().parse(libretto.content));
	let { pairs, elementMap } = $derived.by(() => {
		const elements = parsed.scenes.flatMap((scene) => {
			return scene.elements;
		});

		const pairs: { cue: typeof elements; line: typeof elements }[] = [];
		let currentSpeaker: string | undefined;
		let currentPair: (typeof pairs)[number] = { cue: [], line: [] };
		let elementMap = new Map<SceneElement, number>();

		for (const el of elements) {
			const previousSpeaker = currentSpeaker;

			if (el.type === 'character') {
				currentSpeaker = el.name;
			} else if (el.type === 'dialogue' || el.type === 'lyric') {
				currentSpeaker = el.character;
			}

			const currentSpeakerMatches = characterMatch(libretto.characterName, currentSpeaker);
			const previousSpeakerMatches = characterMatch(libretto.characterName, previousSpeaker);
			const speakerChangedFromMatchToOther = previousSpeakerMatches && !currentSpeakerMatches;

			if (speakerChangedFromMatchToOther) {
				pairs.push(currentPair);
				currentPair = { cue: [], line: [] };
			}

			elementMap.set(el, pairs.length);
			if (currentSpeakerMatches) {
				currentPair.line.push(el);
			} else {
				currentPair.cue.push(el);
			}
		}
		pairs.push(currentPair);
		return { pairs, elementMap };
	});

	let cardStore = $derived(
		new CardStore<SceneElement[]>(
			pairs.map(({ cue, line }) => ({ front: cue, back: line, isFlipped: false })),
			CardFaceSceneElements
		)
	);

	let getIndexFromEl = $derived((el: SceneElement) => {
		return elementMap.get(el);
	});

	let changeViewAtIndex = $derived((index: number) => {
		cardStore.goToCard(index);
		cardStore.unFlipAll();
		// cards = !cards;
	});
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
	<Fountain
		{parsed}
		{cardStore}
		characterName={libretto.characterName}
		startingIndex={cardStore.currentCardIndex}
		{getIndexFromEl}
		{changeViewAtIndex}
	/>
{/if}
