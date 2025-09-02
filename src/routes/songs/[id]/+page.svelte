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
	const playersByLoop = new SvelteMap<number, AudioScheduledSourceNode[]>();
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
		playersByLoop.forEach((arr) => {
			for (const src of arr) {
				try {
					src.stop();
				} catch {
					/* noop */
				}
				try {
					src.disconnect();
				} catch {
					/* noop */
				}
			}
		});
		playersByLoop.clear();
		// keep context alive; user may start again
	}

	// Track a source under a loopId and auto-clean when it ends
	function trackSource(loopId: number, src: AudioBufferSourceNode) {
		const arr = playersByLoop.get(loopId) ?? [];
		arr.push(src);
		playersByLoop.set(loopId, arr);
		src.onended = () => {
			const a = playersByLoop.get(loopId);
			if (!a) return;
			const i = a.indexOf(src);
			if (i >= 0) a.splice(i, 1);
			if (a.length === 0) playersByLoop.delete(loopId);
		};
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
		trackSource(loopId, src);
	}

	function stopPreciseLoop(loopId: number) {
		const arr = playersByLoop.get(loopId);
		if (!arr) return;
		for (const src of arr) {
			try {
				src.stop();
			} catch {
				/* noop */
			}
			try {
				src.disconnect();
			} catch {
				/* noop */
			}
		}
		playersByLoop.delete(loopId);
	}

	// Plays only the first second and last second of the loop (preview of edges)
	async function playPreciseLoopEdges(
		loopId: number,
		start: number,
		end: number,
		opts: { which?: 'start' | 'end' | 'both'; rate?: number },
	) {
		const o = { which: 'both', rate: 1, ...opts };
		const ctx = getCtx();
		if (ctx.state === 'suspended') await ctx.resume();
		const buffer = await ensureDecodedBuffer();

		// Validate and snap boundaries
		if (end <= start) return;
		let s = start;
		let e = end;
		if (SNAP_TO_ZERO) {
			s = snapToZeroCrossing(buffer, start, -1);
			e = snapToZeroCrossing(buffer, end, 1);
			if (e <= s) e = Math.min(buffer.duration, s + 0.005);
		}
		const span = Math.max(0, e - s);
		if (span <= 0) return;

		// Compute segments in buffer time
		const firstDurBuf = Math.min(1, span);
		const lastStartBase = Math.max(s, e - 1);
		const lastStart = SNAP_TO_ZERO ? snapToZeroCrossing(buffer, lastStartBase, -1) : lastStartBase;
		const lastDurBuf = Math.min(1, Math.max(0, e - lastStart));

		// Real-time scheduling (account for playbackRate)
		const fadeIn = 0.005;
		const fadeOut = 0.01;
		const now = ctx.currentTime;
		const t0 = now + 0.02; // slight safety lead

		stopOtherAudio();

		function scheduleSegment(offsetBuf: number, durationBuf: number, when: number) {
			const src = ctx.createBufferSource();
			src.buffer = buffer;
			src.loop = false;
			src.playbackRate.setValueAtTime(Math.max(0.01, o.rate), now);

			const segGain = ctx.createGain();
			segGain.gain.setValueAtTime(0, when);
			segGain.gain.linearRampToValueAtTime(1, when + fadeIn);

			const realDur = durationBuf / Math.max(0.01, o.rate);
			// Fade out just before the end
			segGain.gain.setValueAtTime(1, when + Math.max(0, realDur - fadeOut));
			segGain.gain.linearRampToValueAtTime(0, when + realDur);

			src.connect(segGain).connect(ctx.destination);
			src.start(when, offsetBuf, durationBuf);

			trackSource(loopId, src);
			return realDur;
		}

		if (o.which === 'both') {
			const d1RT = scheduleSegment(lastStart, lastDurBuf, t0);
			scheduleSegment(s, firstDurBuf, t0 + d1RT);
		} else if (o.which === 'start') {
			scheduleSegment(s, firstDurBuf, t0);
		} else if (o.which === 'end') {
			scheduleSegment(lastStart, lastDurBuf, t0);
		}
	}

	// iOS detection (includes iPadOS on M-series with touch)
	const isIOS =
		typeof navigator !== 'undefined' &&
		(/iP(hone|od|ad)/.test(navigator.userAgent) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

	// Track element-based loop (for iOS background playback)
	let elementLoopTimer: number | null = $state(null);
	let elementLoopId: number | null = $state(null);

	function stopElementLoop() {
		if (elementLoopTimer != null) {
			clearInterval(elementLoopTimer);
			elementLoopTimer = null;
		}
		elementLoopId = null;
	}

	function playElementLoop(loopId: number, start: number, end: number, rate = 1) {
		if (!audioElement) return;
		// stop other audio and precise players
		stopOtherAudio(audioElement);

		// configure and start element playback
		audioElement.loop = false; // manual loop between start/end
		audioElement.playbackRate = Math.max(0.01, rate);
		audioElement.currentTime = Math.max(0, start);
		void audioElement.play();

		elementLoopId = loopId;

		// re-enforce boundaries in background
		if (elementLoopTimer != null) clearInterval(elementLoopTimer);
		elementLoopTimer = window.setInterval(() => {
			if (!audioElement) return;
			if (audioElement.currentTime >= end) {
				audioElement.currentTime = start;
			}
		}, 50);
	}

	function isLoopPlaying(loopId: number) {
		return playersByLoop.has(loopId) || elementLoopId === loopId;
	}

	function playLoop(loopId: number, start: number, end: number, opts: { rate?: number } = {}) {
		const o = { rate: 1, ...opts };
		if (isIOS) {
			playElementLoop(loopId, start, end, o.rate);
		} else {
			void playPreciseLoop(loopId, start, end, o.rate);
		}
	}

	function stopLoop(loopId: number) {
		stopPreciseLoop(loopId);
		if (elementLoopId === loopId) stopElementLoop();
		audioElement?.pause();
	}

	// Media Session API for lock-screen/background controls
	$effect(() => {
		if (!$data || !audioElement) return;
		// guard for browsers without the API
		if (!('mediaSession' in navigator)) return;

		navigator.mediaSession.metadata = new MediaMetadata({
			title: $data.song.name,
			artist: '',
			album: 'Think System Memorizer',
			artwork: [],
		});

		navigator.mediaSession.setActionHandler('play', async () => {
			try {
				await audioElement!.play();
			} catch {
				/* noop */
			}
		});
		navigator.mediaSession.setActionHandler('pause', () => {
			audioElement!.pause();
			stopElementLoop();
		});
		navigator.mediaSession.setActionHandler('seekto', (e) => {
			if (!e || e.seekTime == null) return;
			audioElement!.currentTime = e.seekTime;
		});
		navigator.mediaSession.setActionHandler('seekbackward', (e) => {
			const off = e?.seekOffset ?? 10;
			audioElement!.currentTime = Math.max(0, audioElement!.currentTime - off);
		});
		navigator.mediaSession.setActionHandler('seekforward', (e) => {
			const off = e?.seekOffset ?? 30;
			const dur = audioElement!.duration || Number.POSITIVE_INFINITY;
			audioElement!.currentTime = Math.min(dur, audioElement!.currentTime + off);
		});
	});
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
			playsinline
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
							const currentTime = audioElement.currentTime.toFixed(1);
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
							const currentTime = audioElement.currentTime.toFixed(1);
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
			{@const isPlaying = isLoopPlaying(loop.id)}
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
						class="btn border-indigo-400 bg-indigo-500 text-white hover:bg-indigo-600"
						onclick={() => {
							playPreciseLoopEdges(loop.id, loop.start - 0.1, loop.end, {
								rate: audioElement?.playbackRate ?? 1,
								which: 'start',
							});

							updateLoop(loop.id, { start: loop.start - 0.1 });
						}}
					>
						Pull Start
					</button>

					<button
						type="button"
						class="btn border-indigo-400 bg-indigo-500 text-white hover:bg-indigo-600"
						onclick={() => {
							playPreciseLoopEdges(loop.id, loop.start + 0.1, loop.end, {
								rate: audioElement?.playbackRate ?? 1,
								which: 'start',
							});

							updateLoop(loop.id, { start: loop.start + 0.1 });
						}}
					>
						Push Start
					</button>
					<button
						type="button"
						class="btn border-indigo-400 bg-indigo-500 text-white hover:bg-indigo-600"
						onclick={() => {
							playPreciseLoopEdges(loop.id, loop.start, loop.end - 0.1, {
								rate: audioElement?.playbackRate ?? 1,
								which: 'end',
							});

							updateLoop(loop.id, { end: loop.end - 0.1 });
						}}
					>
						Pull End
					</button>
					<button
						type="button"
						class="btn border-indigo-400 bg-indigo-500 text-white hover:bg-indigo-600"
						onclick={() => {
							playPreciseLoopEdges(loop.id, loop.start, loop.end + 0.1, {
								rate: audioElement?.playbackRate ?? 1,
								which: 'end',
							});

							updateLoop(loop.id, { end: loop.end + 0.1 });
						}}
					>
						Push End
					</button>
					<button
						type="button"
						class="btn border-indigo-400 bg-indigo-500 text-white hover:bg-indigo-600"
						onclick={() => {
							playPreciseLoopEdges(loop.id, loop.start, loop.end, {
								rate: audioElement?.playbackRate ?? 1,
							});
						}}>hear loop</button
					>
				</div>

				<div class="mt-4 flex h-16 gap-2">
					<button
						type="button"
						class="btn w-xs border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700"
						onclick={() =>
							isPlaying
								? stopLoop(loop.id)
								: playLoop(loop.id, loop.start, loop.end, {
										rate: audioElement?.playbackRate ?? 1,
									})}
					>
						{isPlaying ? 'Stop' : 'Play'}
					</button>

					<button
						type="button"
						class="btn border-red-400 bg-red-500 text-white hover:bg-red-600"
						onclick={() => {
							stopLoop(loop.id);
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
