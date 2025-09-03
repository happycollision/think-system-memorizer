// iOS detection (includes iPadOS on M-series with touch)
const isIOS =
	typeof navigator !== 'undefined' &&
	(/iP(hone|od|ad)/.test(navigator.userAgent) ||
		(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

const bgPlayKey = 'bgPlayEnabled';
const storedBgPlay = typeof localStorage !== 'undefined' ? localStorage.getItem(bgPlayKey) : null;

const onToggle: (() => void)[] = [];

export const bgPlay = new (class {
	enabled = $state(storedBgPlay ? (JSON.parse(storedBgPlay) as boolean) : isIOS);
	toggle() {
		bgPlay.enabled = !bgPlay.enabled;
		onToggle.forEach((fn) => fn());
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(bgPlayKey, bgPlay.enabled.toString());
		}
	}
	registerOnToggle(fn: () => void) {
		onToggle.push(fn);
		return () => {
			const index = onToggle.indexOf(fn);
			if (index !== -1) onToggle.splice(index, 1);
		};
	}
})();
