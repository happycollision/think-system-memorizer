<script lang="ts">
	import { base } from '$app/paths';
	import { addLoopToSong, deleteLoop, getSongsWithLoops, updateLoop, type Observed } from '../db';
	import { createAudioLooper } from '../loops.svelte';

	interface Props {
		songData: Observed<ReturnType<typeof getSongsWithLoops>>[number];
		edit?: boolean;
	}

	let { songData, edit }: Props = $props();

	const url = $derived(`${base}/${songData.diskName}`);

	let audioElement: HTMLAudioElement | undefined = $state();
	let formElement: HTMLFormElement | undefined = $state();

	let a: Awaited<ReturnType<typeof createAudioLooper>> | undefined = $state();

	// good enough for adjustments
	const sampleStep = 1 / 1000;

	$effect(() => {
		if (!audioElement) return;
		createAudioLooper(audioElement, url).then((looper) => (a = looper));
		return () => a?.destroy();
	});

	$effect(() => {
		a?.setSessionAudioData(
			(currentLoopId) =>
				`${songData.name}: ${songData.loops.find((l) => l.id === currentLoopId)?.name}`,
		);
	});

	function getCurrentTime(): `${number}` {
		return (audioElement?.currentTime.toFixed(1) as `${number}`) ?? '0.0';
	}
</script>

<h1 class="text-3xl font-bold">{songData.name}</h1>

<audio
	bind:this={audioElement}
	controls
	class="my-4 w-full"
	onplay={(evt) => a?.stopOtherAudio(evt.currentTarget)}
>
	Your browser does not support the audio element.
</audio>

{#if edit}
	<form bind:this={formElement} onsubmit={(e) => e.preventDefault()} class="mb-8">
		<div class="grid grid-cols-2 gap-2">
			<input type="number" id="start" disabled placeholder="0.0" step={sampleStep} />
			<input type="number" id="end" disabled placeholder="0.0" step={sampleStep} />
			<button
				type="button"
				class="btn mt-2 bg-blue-500 text-white hover:bg-blue-600"
				onmousedown={() => {
					if (formElement) {
						const currentTime = getCurrentTime();
						const input = formElement.querySelector<HTMLInputElement>("input[id='start']");
						if (input) input.value = currentTime;
					}
				}}
			>
				Set loop start
			</button>

			<button
				type="button"
				class="btn mt-2 bg-blue-500 text-white hover:bg-blue-600"
				onmousedown={() => {
					if (formElement) {
						const currentTime = getCurrentTime();
						const input = formElement.querySelector<HTMLInputElement>("input[id='end']");
						if (input) input.value = currentTime;
					}
				}}
			>
				Set loop end
			</button>
		</div>

		<div>
			<button
				type="button"
				class="btn mt-4 border-green-400 bg-green-500 text-white hover:bg-green-600"
				onclick={async () => {
					if (formElement) {
						const startInput = formElement.querySelector<HTMLInputElement>("input[id='start']");
						const endInput = formElement.querySelector<HTMLInputElement>("input[id='end']");
						if (startInput && endInput) {
							const start = parseFloat(startInput.value);
							const end = parseFloat(endInput.value);
							if (!isNaN(start) && !isNaN(end) && start < end) {
								await addLoopToSong(songData.id, { start, end });
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
{/if}

{#each songData.loops as loop (loop.id)}
	{@const isPlaying = a?.isLoopPlaying(loop.id)}
	<div class="mb-4 rounded border p-4">
		<div class="grid grid-cols-[1fr_auto] items-center gap-4">
			<h2
				id="loop_{loop.id}_title"
				class="text-2xl font-semibold"
				contenteditable
				onblur={(ev) => {
					const newName = ev.currentTarget.innerText.trim();
					if (newName !== loop.name) {
						updateLoop(loop.id, { name: newName || `Loop ${loop.id}` });
					}
				}}
			>
				{loop.name}
			</h2>
		</div>

		<div class="grid grid-cols-2 gap-2">
			<span>Start: {loop.start.toFixed(1)} sec</span>
			<span>End: {loop.end.toFixed(1)} sec</span>

			{#if edit}
				<div class="flex gap-2">
					<button
						type="button"
						class="btn border-indigo-400 bg-indigo-500 text-white hover:bg-indigo-600"
						onclick={() => {
							a?.playPreciseLoopEdges(loop.id, loop.start - 0.1, loop.end, {
								rate: audioElement?.playbackRate ?? 1,
								which: 'start',
							});
							updateLoop(loop.id, { start: loop.start - 0.1 });
						}}
					>
						-
					</button>
					<button
						type="button"
						class="btn border-indigo-400 bg-indigo-500 text-white hover:bg-indigo-600"
						onclick={() => {
							a?.playPreciseLoopEdges(loop.id, loop.start + 0.1, loop.end, {
								rate: audioElement?.playbackRate ?? 1,
								which: 'start',
							});
							updateLoop(loop.id, { start: loop.start + 0.1 });
						}}
					>
						+
					</button>
				</div>

				<div class="flex gap-2">
					<button
						type="button"
						class="btn border-indigo-400 bg-indigo-500 text-white hover:bg-indigo-600"
						onclick={() => {
							a?.playPreciseLoopEdges(loop.id, loop.start, loop.end - 0.1, {
								rate: audioElement?.playbackRate ?? 1,
								which: 'end',
							});
							updateLoop(loop.id, { end: loop.end - 0.1 });
						}}
					>
						-
					</button>
					<button
						type="button"
						class="btn border-indigo-400 bg-indigo-500 text-white hover:bg-indigo-600"
						onclick={() => {
							a?.playPreciseLoopEdges(loop.id, loop.start, loop.end + 0.1, {
								rate: audioElement?.playbackRate ?? 1,
								which: 'end',
							});
							updateLoop(loop.id, { end: loop.end + 0.1 });
						}}
					>
						+
					</button>
				</div>

				<button
					type="button"
					class="btn border-indigo-400 bg-indigo-500 text-white hover:bg-indigo-600"
					onclick={() => {
						a?.playPreciseLoopEdges(loop.id, loop.start, loop.end, {
							rate: audioElement?.playbackRate ?? 1,
						});
					}}>hear loop seam</button
				>
			{/if}
		</div>

		<div class="mt-4 flex h-16 gap-2">
			<button
				type="button"
				class="btn w-xs border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700"
				onclick={() =>
					isPlaying
						? a?.stopLoop(loop.id)
						: a?.playLoop(loop.id, loop.start, loop.end, {
								rate: audioElement?.playbackRate ?? 1,
							})}
			>
				{isPlaying ? 'Stop' : 'Play'}
			</button>

			{#if edit}
				<button
					type="button"
					class="btn border-red-400 bg-red-500 text-white hover:bg-red-600"
					onclick={() => {
						a?.stopLoop(loop.id);
						if (confirm(`Are you sure you want to delete loop "${loop.name}"?`)) {
							deleteLoop(loop.id);
						}
					}}
				>
					Delete
				</button>
			{/if}
		</div>
	</div>
{/each}
