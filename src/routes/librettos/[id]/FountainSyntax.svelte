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
	console.log(libretto);
	let cards = $state(true);

	let parsed = $derived(new FountainParser().parse(libretto.content));
	let parts = $derived.by(() => {
		const elements = parsed.scenes.flatMap((scene) => {
			return scene.elements;
		});

		const pairs: { cue: typeof elements; line: typeof elements }[] = [];
		let currentSpeaker: string | undefined;
		let currentPair: (typeof pairs)[number] = { cue: [], line: [] };

		for (const el of elements) {
			const startingSpeaker = currentSpeaker;

			if (el.type === 'character') {
				currentSpeaker = el.name;
			} else if (el.type === 'dialogue' || el.type === 'lyric') {
				currentSpeaker = el.character;
			}

			const currentSpeakerMatches = characterMatch(libretto.characterName, currentSpeaker);

			if (characterMatch(libretto.characterName, startingSpeaker) && !currentSpeakerMatches) {
				pairs.push(currentPair);
				currentPair = { cue: [], line: [] };
			}

			if (currentSpeakerMatches) {
				currentPair.line.push(el);
			} else {
				currentPair.cue.push(el);
			}
		}
		pairs.push(currentPair);
		return pairs;
	});

	let cardStore = $derived(
		new CardStore<SceneElement[]>(
			parts.map(({ cue, line }) => ({ front: cue, back: line, isFlipped: false })),
			CardFaceSceneElements
		)
	);
</script>

<Header>
	{#snippet title()}
		{libretto.title}
	{/snippet}
</Header>

{#if cards}
	<Cards {cardStore} />
{:else}
	<Fountain {parsed} characterName={libretto.characterName} />
{/if}
