import { browser } from '$app/environment';

const MAX_DAILY_REFRESHES = 5;

const VERSION_KEY = 'app_version';
const noVersion = `LOCAL_VERSION ${Date.now().toString()}`;

function getTodayString() {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

async function getRemoteVersion() {
	try {
		const resp = await window.fetch('/_app/version.json?t=' + Date.now());
		const data = await resp.json();
		return data.version as string;
	} catch {
		return noVersion;
	}
}

function getLocalVersion() {
	try {
		return window.sessionStorage.getItem(VERSION_KEY) || '0';
	} catch {
		return noVersion;
	}
}

function setLocalVersion(version: string) {
	try {
		window.sessionStorage.setItem(VERSION_KEY, version);
	} catch {
		// no-op
	}
}

async function remoteVersionIsGreaterThanLocal() {
	const remote = await getRemoteVersion();
	const local = getLocalVersion();

	return Number(remote) > Number(local);
}

async function initLocalAppVersion() {
	if (!browser) return;

	setLocalVersion(await getRemoteVersion());
}

async function refreshIfAppVersionOutdated() {
	if (!browser) return;

	let refreshes = 0;
	const timesKey = 'app_refreshes_' + getTodayString();

	try {
		refreshes = Number(window.sessionStorage.getItem(timesKey) || '0');
	} catch {
		// If we cannot write to storage, we'll be refreshing every time. Let's bail
		// and save on bandwidth.
		return;
	}

	if (refreshes >= MAX_DAILY_REFRESHES) return;

	if (await remoteVersionIsGreaterThanLocal()) {
		refreshes = refreshes + 1;

		try {
			window.sessionStorage.setItem(timesKey, String(refreshes));
		} catch {
			// At this point, failure to set the item is not a limitation of the
			// browser, since we've attempted other gets and sets already. So treat
			// this like a one-off and ignore the failure.
		}

		if (refreshes > MAX_DAILY_REFRESHES) return;

		window.alert('A new version of this app is available. The page will now refresh to update.');
		window.location.reload();
	}
}

export function checkForNewerAppVersionEffect() {
	initLocalAppVersion();

	const check = () => {
		refreshIfAppVersionOutdated();
	};

	let intervalId: number | undefined;

	const start = () => {
		if (intervalId != null) return;
		intervalId = window.setInterval(check, 1000 * 60 * 10); // run while visible
	};
	const stop = () => {
		if (intervalId == null) return;
		clearInterval(intervalId);
		intervalId = undefined;
	};

	const onVisibility = () => {
		if (document.visibilityState === 'visible') {
			check(); // immediate check when regaining focus
			start();
		} else {
			stop();
		}
	};

	document.addEventListener('visibilitychange', onVisibility);
	onVisibility(); // initialize based on current visibility

	return () => {
		document.removeEventListener('visibilitychange', onVisibility);
		stop();
	};
}
