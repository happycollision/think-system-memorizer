<script lang="ts">
	import AdHocSyntax from './AdHocSyntax.svelte';
	import FountainSyntax from './FountainSyntax.svelte';

	const { data } = $props();
</script>

{#if data.libretto.isFountain}
	<FountainSyntax libretto={data.libretto} />
{:else}
	<AdHocSyntax libretto={data.libretto} />
{/if}
