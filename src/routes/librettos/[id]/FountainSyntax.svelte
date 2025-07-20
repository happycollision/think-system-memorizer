<script lang="ts">
	import type { Libretto } from '../../api/librettos.json/+server';
	import Fountain from './Fountain.svelte';
	import Header from './Header.svelte';

	type Props = {
		libretto: Libretto;
	};

	const { libretto }: Props = $props();
</script>

<Header>
	{#snippet title()}
		{libretto.title}
	{/snippet}
</Header>

<Fountain text={libretto.content} characterName={libretto.characterName} />
