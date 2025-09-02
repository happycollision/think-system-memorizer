// iOS detection (includes iPadOS on M-series with touch)
const isIOS =
	typeof navigator !== 'undefined' &&
	(/iP(hone|od|ad)/.test(navigator.userAgent) ||
		(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

const bgPlayKey = 'bgPlayEnabled';
const storedBgPlay = typeof localStorage !== 'undefined' ? localStorage.getItem(bgPlayKey) : null;

export const bgPlay = new (class {
	enabled = $state(storedBgPlay ? (JSON.parse(storedBgPlay) as boolean) : isIOS);
	toggle() {
		bgPlay.enabled = !bgPlay.enabled;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(bgPlayKey, bgPlay.enabled.toString());
		}
	}
})();
