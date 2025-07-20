<script lang="ts">
	import { FountainParser } from '../../../fountain-parser';
	import type { Libretto } from '../../api/librettos.json/+server';
	import Fountain from './Fountain.svelte';
	import Header from './Header.svelte';

	type Props = {
		libretto: Libretto;
	};

	let { libretto }: Props = $props();
	let parsed = $derived(new FountainParser().parse(libretto.content));
</script>

<Header>
	{#snippet title()}
		{libretto.title}
	{/snippet}
</Header>

<Fountain {parsed} characterName={libretto.characterName} />
