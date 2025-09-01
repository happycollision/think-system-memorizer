<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { addLoopToSong, deleteLoop, getSong, updateLoop } from '../db';

	const songId = $derived(page.params.id);
	const listingUrl = $derived(page.url.pathname.replace(songId, ''));

	const data = $derived(getSong(parseInt(songId)));

	const diskLocation = $derived($data ? `${base}/${$data.song.diskName}` : null);

	let audioElement: HTMLAudioElement | undefined = $state();
	let formElement: HTMLFormElement | undefined = $state();

	// Precise segment looper action for an <audio> element
	function segmentLoop(node: HTMLAudioElement, params: { start: number; end: number }) {
		let loop = { ...params };
		let timer: number | null = null;
		let rafId: number | null = null;

		const clearTimers = () => {
			if (timer !== null) {
				clearTimeout(timer);
				timer = null;
			}
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		};

		const clampToLoop = () => {
			if (node.currentTime < loop.start) node.currentTime = loop.start;
			if (node.currentTime > loop.end) node.currentTime = loop.end;
		};

		const schedule = () => {
			clearTimers();
			if (node.paused) return;

			const rate = Math.max(0.001, node.playbackRate || 1);
			const remainingMs = Math.max(0, ((loop.end - node.currentTime) * 1000) / rate);

			// Wake up slightly early, then finish with RAF for sub-frame precision
			const earlyMs = Math.max(0, remainingMs - 60);
			timer = window.setTimeout(() => {
				const check = () => {
					if (node.paused) return;
					// Small epsilon to avoid float errors
					if (node.currentTime >= loop.end - 0.002) {
						node.currentTime = loop.start;
						// Ensure playback continues after seek
						void node.play();
						schedule();
					} else {
						rafId = requestAnimationFrame(check);
					}
				};
				check();
			}, earlyMs);
		};

		const onPlay = () => {
			clampToLoop();
			schedule();
		};
		const onPause = () => clearTimers();
		const onSeeking = () => {
			clampToLoop();
			if (!node.paused) schedule();
		};
		const onRateChange = () => {
			if (!node.paused) schedule();
		};
		const onLoaded = () => {
			node.currentTime = loop.start;
		};

		node.addEventListener('play', onPlay);
		node.addEventListener('pause', onPause);
		node.addEventListener('seeking', onSeeking);
		node.addEventListener('ratechange', onRateChange);
		node.addEventListener('loadedmetadata', onLoaded);

		return () => {
			clearTimers();
			node.removeEventListener('play', onPlay);
			node.removeEventListener('pause', onPause);
			node.removeEventListener('seeking', onSeeking);
			node.removeEventListener('ratechange', onRateChange);
			node.removeEventListener('loadedmetadata', onLoaded);
		};
	}
</script>

<nav>
	<a href={listingUrl} class="btn">Back to Songs</a>
</nav>

Hi. This is song {songId}.

{#if $data}
	<h1 class="text-3xl font-bold">{$data.song.name}</h1>
	<p>From disk: {$data.song.diskName}</p>

	<audio bind:this={audioElement} controls class="my-4 w-full" preload="auto">
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
					if (audioElement && formElement) {
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
					if (audioElement && formElement) {
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

	{#each $data.songLoops as loop (loop.id)}
		<div class="mb-4 rounded border p-4">
			<h2 id="loop_{loop.id}_title" class="text-2xl font-semibold" contenteditable>{loop.name}</h2>
			<button
				type="button"
				class="btn"
				onclick={() => {
					const newName = document
						.querySelector<HTMLElement>(`#loop_${loop.id}_title`)
						?.innerText.trim();
					updateLoop(loop.id, { name: newName || `Loop ${loop.id}` });
				}}>update name</button
			>
			<audio
				controls
				class="my-2 w-full"
				preload="auto"
				{@attach (el) => {
					segmentLoop(el, { start: loop.start, end: loop.end });
				}}
			>
				<source src={diskLocation} type="audio/wav" />
				Your browser does not support the audio element.
			</audio>
			<p>Start: {loop.start} End: {loop.end}</p>
			<button
				type="button"
				class="mt-2 rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
				onclick={() => {
					if (confirm(`Are you sure you want to delete loop "${loop.name}"?`)) {
						deleteLoop(loop.id);
					}
				}}>Delete</button
			>
		</div>
	{/each}
{/if}
