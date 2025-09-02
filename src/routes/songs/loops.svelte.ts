import { SvelteMap } from 'svelte/reactivity';
import { bgPlay } from './backgroundPlay.svelte';

const SNAP_TO_ZERO = true; // set false to use exact times

export class AudioLooper {
	private audioElement: HTMLAudioElement;
	private url: string;

	private onDestroy: (() => void)[] = [];

	constructor(audioElement: HTMLAudioElement, url: string) {
		this.audioElement = audioElement;
		this.url = url;
		this.audioElement.src = url;
		this.onDestroy.push(this.preload());
	}

	public destroy = () => {
		this.stopAllPrecise();
		this.stopElementLoop();
		this.onDestroy.forEach((fn) => fn());
		this.onDestroy = [];
	};

	private preload = () => {
		const ac = new AbortController();

		// Warm the browser cache immediately
		fetch(this.url, { cache: 'force-cache', signal: ac.signal }).catch(() => {
			/* noop */
		});

		// Ask the media element to start loading (no playback)
		if (this.audioElement) {
			if (this.audioElement.preload !== 'auto') this.audioElement.preload = 'auto';
			// Only call load() if it hasn't begun loading to avoid interrupting playback later
			if (this.audioElement.readyState === 0) this.audioElement.load();
		}

		return () => ac.abort();
	};

	public stopOtherAudio(thisAudio?: HTMLAudioElement) {
		this.stopAllPrecise();
		document.querySelectorAll('audio').forEach((audio) => {
			if (audio !== thisAudio) {
				if (!audio.paused) audio.pause();
			}
		});
	}

	// Precise Web Audio loop playback (sample-accurate)
	audioCtx: AudioContext | null = $state(null);
	decodedBuffer: AudioBuffer | null = $state(null);
	playersByLoop = new SvelteMap<number, AudioScheduledSourceNode[]>();
	SNAP_TO_ZERO = true; // set false to use exact times

	private getCtx() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (this.audioCtx ??= new (window.AudioContext || (window as any).webkitAudioContext)());
	}

	private async ensureDecodedBuffer(url: string): Promise<AudioBuffer> {
		if (this.decodedBuffer) return this.decodedBuffer;
		if (!url) throw new Error('No diskLocation via url');
		const ctx = this.getCtx();
		const res = await fetch(url, { cache: 'force-cache' });
		const arr = await res.arrayBuffer();
		this.decodedBuffer = await new Promise<AudioBuffer>((resolve, reject) =>
			ctx.decodeAudioData(arr, resolve, reject),
		);
		return this.decodedBuffer;
	}

	private snapToZeroCrossing(buffer: AudioBuffer, timeSec: number, dir: 1 | -1, maxMs = 8): number {
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
	uiRaf: number | null = $state(null);
	uiSyncLoopId: number | null = $state(null);

	public stopUiPlayheadSync = () => {
		if (this.uiRaf != null) cancelAnimationFrame(this.uiRaf);
		this.uiRaf = null;
		this.uiSyncLoopId = null;
	};

	public startUiPlayheadSync = (
		loopId: number,
		loopStart: number,
		loopEnd: number,
		rate: number,
		whenCtx: number,
	) => {
		this.stopUiPlayheadSync();
		const ctx = this.getCtx();
		const span = Math.max(0.001, loopEnd - loopStart);

		this.uiSyncLoopId = loopId;
		try {
			this.audioElement.currentTime = loopStart;
			// prime the UI to the loop start
		} catch {
			/* noop */
		}

		const tick = () => {
			// if the underlying precise players for this loop stopped, end sync
			if (!this.playersByLoop.has(loopId)) return this.stopUiPlayheadSync();

			const now = ctx.currentTime;
			const t = Math.max(0, now - whenCtx);
			const played = t * Math.max(0.01, rate);
			const pos = loopStart + (played % span);

			// only update if the UI is noticeably off to reduce churn
			if (Math.abs(this.audioElement.currentTime - pos) > 0.033) {
				try {
					this.audioElement.currentTime = pos;
				} catch {
					/* noop */
				}
			}
			this.uiRaf = requestAnimationFrame(tick);
		};
		this.uiRaf = requestAnimationFrame(tick);
	};

	public stopAllPrecise() {
		this.playersByLoop.forEach((arr) => {
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
		this.playersByLoop.clear();
		// keep context alive; user may start again
		this.stopUiPlayheadSync();
	}

	// Track a source under a loopId and auto-clean when it ends
	private trackSource(loopId: number, src: AudioBufferSourceNode) {
		const arr = this.playersByLoop.get(loopId) ?? [];
		arr.push(src);
		this.playersByLoop.set(loopId, arr);
		src.onended = () => {
			const a = this.playersByLoop.get(loopId);
			if (!a) return;
			const i = a.indexOf(src);
			if (i >= 0) a.splice(i, 1);
			if (a.length === 0) this.playersByLoop.delete(loopId);
		};
	}

	private async playPreciseLoop(url: string, loopId: number, start: number, end: number, rate = 1) {
		const ctx = this.getCtx();
		if (ctx.state === 'suspended') await ctx.resume();
		const buffer = await this.ensureDecodedBuffer(url);

		// Optional zero-crossing snap to reduce clicks at loop boundaries
		let s = start;
		let e = end;
		if (SNAP_TO_ZERO) {
			s = this.snapToZeroCrossing(buffer, start, -1);
			e = this.snapToZeroCrossing(buffer, end, 1);
			if (e <= s) e = Math.min(buffer.duration, s + 0.005); // enforce a minimal loop span
		}

		this.stopOtherAudio();

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
		this.trackSource(loopId, src);

		// Keep the <audio> element's playhead in sync for UI purposes
		this.startUiPlayheadSync(loopId, s, e, rate, when);
	}

	stopPreciseLoop(loopId: number) {
		const arr = this.playersByLoop.get(loopId);
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
		this.playersByLoop.delete(loopId);
		if (this.uiSyncLoopId === loopId) this.stopUiPlayheadSync();
	}

	// Plays only the first second and last second of the loop (preview of edges)
	public playPreciseLoopEdges = async (
		loopId: number,
		start: number,
		end: number,
		opts: { which?: 'start' | 'end' | 'both'; rate?: number },
	) => {
		const o = { which: 'both', rate: 1, ...opts };
		const ctx = this.getCtx();
		if (ctx.state === 'suspended') await ctx.resume();
		const buffer = await this.ensureDecodedBuffer(this.url);

		// Validate and snap boundaries
		if (end <= start) return;
		let s = start;
		let e = end;
		if (SNAP_TO_ZERO) {
			s = this.snapToZeroCrossing(buffer, start, -1);
			e = this.snapToZeroCrossing(buffer, end, 1);
			if (e <= s) e = Math.min(buffer.duration, s + 0.005);
		}
		const span = Math.max(0, e - s);
		if (span <= 0) return;

		// Compute segments in buffer time
		const firstDurBuf = Math.min(1, span);
		const lastStartBase = Math.max(s, e - 1);
		const lastStart = SNAP_TO_ZERO
			? this.snapToZeroCrossing(buffer, lastStartBase, -1)
			: lastStartBase;
		const lastDurBuf = Math.min(1, Math.max(0, e - lastStart));

		// Real-time scheduling (account for playbackRate)
		const fadeIn = 0.005;
		const fadeOut = 0.01;
		const now = ctx.currentTime;
		const t0 = now + 0.02; // slight safety lead

		this.stopOtherAudio();

		const scheduleSegment = (offsetBuf: number, durationBuf: number, when: number) => {
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

			this.trackSource(loopId, src);
			return realDur;
		};

		if (o.which === 'both') {
			const d1RT = scheduleSegment(lastStart, lastDurBuf, t0);
			scheduleSegment(s, firstDurBuf, t0 + d1RT);
		} else if (o.which === 'start') {
			scheduleSegment(s, firstDurBuf, t0);
		} else if (o.which === 'end') {
			scheduleSegment(lastStart, lastDurBuf, t0);
		}
	};

	// Track element-based loop (for iOS background playback)
	elementLoopTimer: number | null = $state(null);
	elementLoopId: number | null = $state(null);

	public stopElementLoop = () => {
		if (this.elementLoopTimer != null) {
			clearInterval(this.elementLoopTimer);
			this.elementLoopTimer = null;
		}
		this.elementLoopId = null;
	};

	public playElementLoop = (loopId: number, start: number, end: number, rate = 1) => {
		// stop other audio and precise players
		this.stopOtherAudio();

		// configure and start element playback
		this.audioElement.loop = false; // manual loop between start/end
		this.audioElement.playbackRate = Math.max(0.01, rate);
		this.audioElement.currentTime = Math.max(0, start);
		this.audioElement.play();

		this.elementLoopId = loopId;

		// re-enforce boundaries in background
		if (this.elementLoopTimer != null) clearInterval(this.elementLoopTimer);
		this.elementLoopTimer = window.setInterval(() => {
			if (this.audioElement.currentTime >= end) {
				this.audioElement.currentTime = start;
			}
		}, 50);
	};

	public isLoopPlaying = (loopId: number) => {
		return this.playersByLoop.has(loopId) || this.elementLoopId === loopId;
	};

	public playLoop = (loopId: number, start: number, end: number, opts: { rate?: number } = {}) => {
		const o = { rate: 1, ...opts };
		if (bgPlay.enabled) {
			this.playElementLoop(loopId, start, end, o.rate);
		} else {
			this.playPreciseLoop(this.url, loopId, start, end, o.rate);
		}
	};

	public stopLoop = (loopId: number) => {
		this.stopPreciseLoop(loopId);
		if (this.elementLoopId === loopId) this.stopElementLoop();
		this.audioElement.pause();
	};

	public setSessionAudioData = (getTitle: (currentLoopId: number | null) => string) => {
		// guard for browsers without the API
		if (!('mediaSession' in navigator)) return;

		navigator.mediaSession.metadata = new MediaMetadata({
			title: getTitle(this.elementLoopId),
			artist: '',
			album: 'Think System Memorizer',
			artwork: [],
		});

		navigator.mediaSession.setActionHandler('play', async () => {
			try {
				await this.audioElement.play();
			} catch {
				/* noop */
			}
		});
		navigator.mediaSession.setActionHandler('pause', () => {
			this.audioElement.pause();
			this.stopElementLoop();
		});
		navigator.mediaSession.setActionHandler('seekto', (e) => {
			if (!e || e.seekTime == null) return;
			this.audioElement.currentTime = e.seekTime;
		});
		navigator.mediaSession.setActionHandler('seekbackward', (e) => {
			const off = e?.seekOffset ?? 10;
			this.audioElement.currentTime = Math.max(0, this.audioElement.currentTime - off);
		});
		navigator.mediaSession.setActionHandler('seekforward', (e) => {
			const off = e?.seekOffset ?? 30;
			const dur = this.audioElement.duration || Number.POSITIVE_INFINITY;
			this.audioElement.currentTime = Math.min(dur, this.audioElement.currentTime + off);
		});
	};
}
