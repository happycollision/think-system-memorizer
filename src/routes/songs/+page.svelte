<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { getSongs } from './db';

	// get list of songs from indexdb store

	const songs = getSongs();
	const currentPage = $derived(page.url.pathname);
</script>

<svelte:head>
	<title>Songs - Think System Memorizer</title>
</svelte:head>

<a href="{base}/librettos" class="mb-6 inline-block text-blue-600 hover:underline">Librettos</a>

<div class="mx-auto max-w-6xl p-8">
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
</div>
