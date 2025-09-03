<script lang="ts">
	import { page } from '$app/state';
	import { getSong } from '../db';
	import BackgroundPlayToggle from '../BackgroundPlayToggle.svelte';
	import Song from './Song.svelte';

	const songId = $derived(page.params.id);
	const listingUrl = $derived(page.url.pathname.replace(songId, ''));

	const data = $derived(getSong(parseInt(songId)));
</script>

<div class="p-2">
	<nav class="mb-4">
		<a href={listingUrl} class="btn">Back to Songs</a>
	</nav>

	{#if $data}
		<Song songData={$data} />
	{/if}
</div>
