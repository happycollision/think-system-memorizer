<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { addLoopToSong, getSong } from '../db';

	const songId = $derived(page.params.id);
	const listingUrl = $derived(page.url.pathname.replace(songId, ''));

	const data = $derived(getSong(parseInt(songId)));

	const diskLocation = $derived(data ? `${base}/${$data.song.diskName}` : null);

	let audioElement: HTMLAudioElement;
	let formElement: HTMLFormElement;
</script>

<nav>
	<a href={listingUrl} class="btn">Back to Songs</a>
</nav>

Hi. This is song {songId}.

{#if $data}
	<h1 class="text-3xl font-bold">{$data.song.name}</h1>
	<p>From disk: {$data.song.diskName}</p>

	<audio bind:this={audioElement} controls class="my-4 w-full" preload="metadata">
		<source src={diskLocation} type="audio/wav" />
		Your browser does not support the audio element.
	</audio>

	<form bind:this={formElement} onsubmit={(e) => e.preventDefault()} class="mb-8">
		<label for="start" class="mb-1 block font-medium">Default Loop Start (seconds)</label>
		<div class="grid grid-cols-2 gap-2">
			<input
				type="number"
				id="start"
				class="w-full rounded border border-gray-300 p-2"
				placeholder="e.g., 30.5"
			/>
			<button
				type="button"
				class="mt-2 rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
				onclick={() => {
					if (audioElement) {
						const input = formElement.querySelector<HTMLInputElement>("input[id='start']");
						if (input) input.value = audioElement.currentTime.toString();
					}
				}}
			>
				Set to Current Time
			</button>
		</div>

		<label for="end" class="mt-4 mb-1 block font-medium">Default Loop End (seconds)</label>
		<div class="grid grid-cols-2 gap-2">
			<input
				type="number"
				id="end"
				class="w-full rounded border border-gray-300 p-2"
				placeholder="e.g., 45.0"
			/>
			<button
				type="button"
				class="mt-2 rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
				onclick={() => {
					if (audioElement) {
						const input = formElement.querySelector<HTMLInputElement>("input[id='end']");
						if (input) input.value = audioElement.currentTime.toString();
					}
				}}
			>
				Set to Current Time
			</button>
		</div>

		<div>
			<button
				type="button"
				class="mt-4 rounded bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600"
				onclick={async () => {
					if (formElement) {
						const startInput = formElement.querySelector<HTMLInputElement>("input[id='start']");
						const endInput = formElement.querySelector<HTMLInputElement>("input[id='end']");
						if (startInput && endInput) {
							const start = parseFloat(startInput.value);
							const end = parseFloat(endInput.value);
							if (!isNaN(start) && !isNaN(end) && start < end) {
								await addLoopToSong($data.song.id, { start, end });
								startInput.value = '';
								endInput.value = '';
							} else {
								alert('Please enter valid start and end times. Start must be less than End.');
							}
						}
					}
				}}
			>
				Add Loop
			</button>
		</div>
	</form>

	{#each $data.songLoops as loop (loop.name)}
		<div class="mb-4 rounded border p-4">
			<h2 class="text-2xl font-semibold">{loop.name}</h2>
			<audio
				controls
				class="my-2 w-full"
				preload="metadata"
				onloadedmetadata={(e) => {
					const a = e.currentTarget as HTMLAudioElement;
					a.currentTime = loop.start;
				}}
				onplay={(e) => {
					const a = e.currentTarget as HTMLAudioElement;
					if (a.currentTime < loop.start || a.currentTime > loop.end) {
						a.currentTime = loop.start;
					}
				}}
				ontimeupdate={(e) => {
					const a = e.currentTarget as HTMLAudioElement;
					if (a.currentTime >= loop.end) {
						a.pause();
						a.currentTime = loop.start; // or loop.end if you prefer
					}
				}}
				onseeking={(e) => {
					const a = e.currentTarget as HTMLAudioElement;
					if (a.currentTime < loop.start) a.currentTime = loop.start;
					if (a.currentTime > loop.end) a.currentTime = loop.end;
				}}
			>
				<source src={diskLocation} type="audio/wav" />
				Your browser does not support the audio element.
			</audio>
			<p>Start: {loop.start} End: {loop.end}</p>
		</div>
	{/each}
{/if}
