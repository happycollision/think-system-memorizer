<script lang="ts">
	import { page } from '$app/state';
	import { getSongsWithLoops } from '../db';
	import BackgroundPlayToggle from '../BackgroundPlayToggle.svelte';
	import Song from './Song.svelte';

	const songId = $derived(page.params.id);
	const listingUrl = $derived(page.url.pathname.replace(songId, ''));

	const data = $derived(getSongsWithLoops([parseInt(songId)]));
</script>

<div class="p-2">
	<nav class="mb-4">
		<a href={listingUrl} class="btn">Back to Songs</a>
	</nav>

	<BackgroundPlayToggle />

	{#if $data && $data[0]}
		<Song songData={$data[0]} edit />
	{/if}
</div>
