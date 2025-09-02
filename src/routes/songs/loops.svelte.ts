import { SvelteMap } from 'svelte/reactivity';
import { bgPlay } from './backgroundPlay.svelte';

let audioElement: HTMLAudioElement | undefined = $state();

export function setAudioElement(el: HTMLAudioElement | undefined) {
	audioElement = el;
}

export function stopOtherAudio(thisAudio?: HTMLAudioElement) {
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

function getCtx() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (audioCtx ??= new (window.AudioContext || (window as any).webkitAudioContext)());
}

async function ensureDecodedBuffer(url: string): Promise<AudioBuffer> {
	if (decodedBuffer) return decodedBuffer;
	if (!url) throw new Error('No diskLocation via url');
	const ctx = getCtx();
	const res = await fetch(url, { cache: 'force-cache' });
	const arr = await res.arrayBuffer();
	decodedBuffer = await new Promise<AudioBuffer>((resolve, reject) =>
		ctx.decodeAudioData(arr, resolve, reject),
	);
	return decodedBuffer;
}

function snapToZeroCrossing(buffer: AudioBuffer, timeSec: number, dir: 1 | -1, maxMs = 8): number {
	const ch = 0;
	const sr = buffer.sampleRate;
	const data = buffer.getChannelData(ch);
	const win = Math.min(Math.round((maxMs / 1000) * sr), data.length - 2);
	const idx = Math.max(1, Math.min(data.length - 2, Math.round(timeSec * sr)));
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

// UI playhead sync for precise playback (keeps <audio> slider updated while WebAudio plays)
let uiRaf: number | null = $state(null);
let uiSyncLoopId: number | null = $state(null);

function stopUiPlayheadSync() {
	if (uiRaf != null) cancelAnimationFrame(uiRaf);
	uiRaf = null;
	uiSyncLoopId = null;
}

function startUiPlayheadSync(
	loopId: number,
	loopStart: number,
	loopEnd: number,
	rate: number,
	whenCtx: number,
) {
	stopUiPlayheadSync();
	if (!audioElement) return;
	const ctx = getCtx();
	const span = Math.max(0.001, loopEnd - loopStart);

	uiSyncLoopId = loopId;
	try {
		// prime the UI to the loop start
		audioElement.currentTime = loopStart;
	} catch {
		/* noop */
	}

	const tick = () => {
		if (!audioElement) return stopUiPlayheadSync();
		// if the underlying precise players for this loop stopped, end sync
		if (!playersByLoop.has(loopId)) return stopUiPlayheadSync();

		const now = ctx.currentTime;
		const t = Math.max(0, now - whenCtx);
		const played = t * Math.max(0.01, rate);
		const pos = loopStart + (played % span);

		// only update if the UI is noticeably off to reduce churn
		if (Math.abs(audioElement.currentTime - pos) > 0.033) {
			try {
				audioElement.currentTime = pos;
			} catch {
				/* noop */
			}
		}
		uiRaf = requestAnimationFrame(tick);
	};
	uiRaf = requestAnimationFrame(tick);
}

export function stopAllPrecise() {
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
	stopUiPlayheadSync();
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

async function playPreciseLoop(url: string, loopId: number, start: number, end: number, rate = 1) {
	const ctx = getCtx();
	if (ctx.state === 'suspended') await ctx.resume();
	const buffer = await ensureDecodedBuffer(url);

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

	// Keep the <audio> element's playhead in sync for UI purposes
	startUiPlayheadSync(loopId, s, e, rate, when);
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
	if (uiSyncLoopId === loopId) stopUiPlayheadSync();
}

// Plays only the first second and last second of the loop (preview of edges)
export async function playPreciseLoopEdges(
	url: string | null,
	loopId: number,
	start: number,
	end: number,
	opts: { which?: 'start' | 'end' | 'both'; rate?: number },
) {
	if (!url) return;
	const o = { which: 'both', rate: 1, ...opts };
	const ctx = getCtx();
	if (ctx.state === 'suspended') await ctx.resume();
	const buffer = await ensureDecodedBuffer(url);

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

// Track element-based loop (for iOS background playback)
let elementLoopTimer: number | null = $state(null);
let elementLoopId: number | null = $state(null);

export function stopElementLoop() {
	if (elementLoopTimer != null) {
		clearInterval(elementLoopTimer);
		elementLoopTimer = null;
	}
	elementLoopId = null;
}

function playElementLoop(loopId: number, start: number, end: number, rate = 1) {
	if (!audioElement) return;
	// stop other audio and precise players
	stopOtherAudio();

	// configure and start element playback
	audioElement.loop = false; // manual loop between start/end
	audioElement.playbackRate = Math.max(0.01, rate);
	audioElement.currentTime = Math.max(0, start);
	audioElement.play();

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

export function isLoopPlaying(loopId: number) {
	return playersByLoop.has(loopId) || elementLoopId === loopId;
}

export function playLoop(
	url: string | null,
	loopId: number,
	start: number,
	end: number,
	opts: { rate?: number } = {},
) {
	const o = { rate: 1, ...opts };
	if (bgPlay.enabled || url === null) {
		playElementLoop(loopId, start, end, o.rate);
	} else {
		playPreciseLoop(url, loopId, start, end, o.rate);
	}
}

export function stopLoop(loopId: number) {
	stopPreciseLoop(loopId);
	if (elementLoopId === loopId) stopElementLoop();
	audioElement?.pause();
}

export function setSessionAudioData(getTitle: (currentLoopId: number | null) => string) {
	if (!audioElement) return;
	const audioElement_ = audioElement;
	// guard for browsers without the API
	if (!('mediaSession' in navigator)) return;

	navigator.mediaSession.metadata = new MediaMetadata({
		title: getTitle(elementLoopId),
		artist: '',
		album: 'Think System Memorizer',
		artwork: [],
	});

	navigator.mediaSession.setActionHandler('play', async () => {
		try {
			await audioElement_.play();
		} catch {
			/* noop */
		}
	});
	navigator.mediaSession.setActionHandler('pause', () => {
		audioElement_.pause();
		stopElementLoop();
	});
	navigator.mediaSession.setActionHandler('seekto', (e) => {
		if (!e || e.seekTime == null) return;
		audioElement_.currentTime = e.seekTime;
	});
	navigator.mediaSession.setActionHandler('seekbackward', (e) => {
		const off = e?.seekOffset ?? 10;
		audioElement_.currentTime = Math.max(0, audioElement_.currentTime - off);
	});
	navigator.mediaSession.setActionHandler('seekforward', (e) => {
		const off = e?.seekOffset ?? 30;
		const dur = audioElement_.duration || Number.POSITIVE_INFINITY;
		audioElement_.currentTime = Math.min(dur, audioElement_.currentTime + off);
	});
}
