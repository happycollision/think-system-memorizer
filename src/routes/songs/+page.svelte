<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import Song from './[id]/Song.svelte';
	import { exportDatabase, getSongsWithLoops } from './db';

	let songs = getSongsWithLoops();
	let currentPage = $derived(page.url.pathname);
	let songsWithLoops = $derived($songs?.filter((s) => s.loops.length > 0) || []);
	let editingList = $state(false);
</script>

<svelte:head>
	<title>Songs - Think System Memorizer</title>
</svelte:head>

<a href="{base}/librettos" class="mb-6 inline-block text-blue-600 hover:underline">Librettos</a>

<!-- add a switch here for the editingList boolean -->
<button
	class="mb-6 ml-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
	onclick={() => (editingList = !editingList)}
>
	{editingList ? 'View Songs' : 'Edit Songs'}
</button>

<button
	onclick={async () => {
		const data = JSON.stringify(await exportDatabase());
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'think-system-memorizer-export.json';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}}
	type="button"
	class="btn">Export data</button
>

<div class="mx-auto max-w-6xl p-2">
	{#if editingList}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each $songs as song (song.name)}
				<div
					class="relative isolate rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:bg-gray-200 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
				>
					<h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
						<a href="{currentPage}/{song.id}">
							{song.name}
							<span class="absolute inset-0"></span>
						</a>
					</h3>
				</div>
			{/each}
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each songsWithLoops as song (song.name)}
				<div
					class="relative isolate rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-all dark:border-gray-600 dark:bg-gray-800"
				>
					<h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
						<Song songData={song} />
					</h3>
				</div>
			{/each}
		</div>
	{/if}
</div>
