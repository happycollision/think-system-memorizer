<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { addLoopToSong, deleteLoop, getSong, updateLoop } from '../db';

	const songId = $derived(page.params.id);
	const listingUrl = $derived(page.url.pathname.replace(songId, ''));

	const data = $derived(getSong(parseInt(songId)));

	const diskLocation = $derived($data ? `${base}/${$data.song.diskName}` : null);

	let audioElement: HTMLAudioElement | undefined = $state();
	let formElement: HTMLFormElement | undefined = $state();

	function stopOtherAudio(thisAudio?: HTMLAudioElement) {
		stopAllPrecise();
		document.querySelectorAll('audio').forEach((audio) => {
			if (audio !== thisAudio) {
				if (!audio.paused) audio.pause();
			}
		});
	}

	// Precise Web Audio loop playback (sample-accurate)
	let audioCtx: AudioContext | null = $state(null);
	let decodedBuffer: AudioBuffer | null = $state(null);
	const playersByLoop = new SvelteMap<number, AudioBufferSourceNode>();
	const SNAP_TO_ZERO = true; // set false to use exact times

	// good enough for adjustments
	const sampleStep = 1 / 1000;

	function getCtx() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (audioCtx ??= new (window.AudioContext || (window as any).webkitAudioContext)());
	}

	async function ensureDecodedBuffer(): Promise<AudioBuffer> {
		if (decodedBuffer) return decodedBuffer;
		if (!diskLocation) throw new Error('No diskLocation');
		const ctx = getCtx();
		const res = await fetch(diskLocation, { cache: 'force-cache' });
		const arr = await res.arrayBuffer();
		decodedBuffer = await new Promise<AudioBuffer>((resolve, reject) =>
			ctx.decodeAudioData(arr, resolve, reject),
		);
		return decodedBuffer;
	}

	function snapToZeroCrossing(
		buffer: AudioBuffer,
		timeSec: number,
		dir: 1 | -1,
		maxMs = 8,
	): number {
		const ch = 0;
		const sr = buffer.sampleRate;
		const data = buffer.getChannelData(ch);
		const win = Math.min(Math.round((maxMs / 1000) * sr), data.length - 2);
		let idx = Math.max(1, Math.min(data.length - 2, Math.round(timeSec * sr)));
		for (let i = 0; i < win; i++) {
			const j = dir < 0 ? idx - i : idx + i;
			if (j <= 1 || j >= data.length - 2) break;
			const a = data[j - 1];
			const b = data[j];
			// look for sign change (zero crossing)
			if ((a <= 0 && b >= 0) || (a >= 0 && b <= 0)) return j / sr;
		}
		return idx / sr;
	}

	function stopAllPrecise() {
		playersByLoop.forEach((src) => {
			try {
				src.stop();
			} catch {
				//noop
			}
			try {
				src.disconnect();
			} catch {
				//noop
			}
		});
		playersByLoop.clear();
		// keep context alive; user may start again
	}

	async function playPreciseLoop(loopId: number, start: number, end: number, rate = 1) {
		const ctx = getCtx();
		if (ctx.state === 'suspended') await ctx.resume();
		const buffer = await ensureDecodedBuffer();

		// Optional zero-crossing snap to reduce clicks at loop boundaries
		let s = start;
		let e = end;
		if (SNAP_TO_ZERO) {
			s = snapToZeroCrossing(buffer, start, -1);
			e = snapToZeroCrossing(buffer, end, 1);
			if (e <= s) e = Math.min(buffer.duration, s + 0.005); // enforce a minimal loop span
		}

		stopOtherAudio();

		const src = ctx.createBufferSource();
		src.buffer = buffer;
		src.loop = true;
		src.loopStart = s;
		src.loopEnd = e;
		src.playbackRate.setValueAtTime(Math.max(0.01, rate), ctx.currentTime);

		// Small fade-in to eliminate start click
		const gain = ctx.createGain();
		gain.gain.setValueAtTime(0, ctx.currentTime);
		gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.005);

		src.connect(gain).connect(ctx.destination);

		const when = ctx.currentTime + 0.005;
		src.start(when, s);
		playersByLoop.set(loopId, src);
	}

	function stopPreciseLoop(loopId: number) {
		const src = playersByLoop.get(loopId);
		if (!src) return;
		try {
			src.stop();
		} catch {
			// noop
		}
		try {
			src.disconnect();
		} catch {
			// noop
		}
		playersByLoop.delete(loopId);
	}
</script>

<div class="p-2">
	<nav class="mb-4">
		<a href={listingUrl} class="btn">Back to Songs</a>
	</nav>

	{#if $data}
		<h1 class="text-3xl font-bold">{$data.song.name}</h1>

		<audio
			bind:this={audioElement}
			controls
			class="my-4 w-full"
			preload="auto"
			onplay={(evt) => stopOtherAudio(evt.currentTarget)}
		>
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
					step={sampleStep}
				/>
				<button
					type="button"
					class="mt-2 rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
					onmousedown={() => {
						if (audioElement && formElement) {
							const currentTime = audioElement.currentTime.toString();
							const input = formElement.querySelector<HTMLInputElement>("input[id='start']");
							if (input) input.value = currentTime;
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
					step={sampleStep}
				/>
				<button
					type="button"
					class="mt-2 rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
					onmousedown={() => {
						if (audioElement && formElement) {
							const currentTime = audioElement.currentTime.toString();
							const input = formElement.querySelector<HTMLInputElement>("input[id='end']");
							if (input) input.value = currentTime;
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

		<hr />

		{#each $data.songLoops as loop (loop.id)}
			{@const isPlaying = playersByLoop.has(loop.id)}
			<div class="mb-4 rounded border p-4">
				<div class="grid grid-cols-[1fr_auto] items-center gap-4">
					<h2 id="loop_{loop.id}_title" class="text-2xl font-semibold" contenteditable>
						{loop.name}
					</h2>
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
				</div>

				<p>Start: {loop.start} End: {loop.end}</p>

				<div class="flex gap-2">
					<button
						type="button"
						class="btn w-xs border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700"
						onclick={() =>
							isPlaying
								? stopPreciseLoop(loop.id)
								: playPreciseLoop(loop.id, loop.start, loop.end, audioElement?.playbackRate ?? 1)}
					>
						{isPlaying ? 'Stop' : 'Play'}
					</button>
					<button
						type="button"
						class="btn border-red-400 bg-red-500 text-white hover:bg-red-600"
						onclick={() => {
							stopPreciseLoop(loop.id);
							if (confirm(`Are you sure you want to delete loop "${loop.name}"?`)) {
								deleteLoop(loop.id);
							}
						}}
					>
						Delete
					</button>
				</div>
			</div>
		{/each}
	{/if}
</div>
