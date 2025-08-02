import { browser } from '$app/environment';
import { replaceState } from '$app/navigation';
import { page } from '$app/state';

/**
 * Why do we need this? Because some weird stuff happens on iOS Webkit (or mobile in general?) where app navigation via goto totally trashes the scrolling behavior.
 */
export const navState = new (class NavState {
	card = $derived(page.state.card ?? Number((browser && page.url.searchParams.get('card')) || '1'));

	shouldScroll = $state(false);

	#isScrolling = false;

	private setSearchParam<T extends keyof App.PageState>(key: T, value: App.PageState[T]) {
		if (!browser) return;
		const newUrl = new URL(page.url);
		newUrl.searchParams.set(key, String(value));
		replaceState(newUrl, { ...page.state, [key]: value });
	}

	setCard = (card1Indexed: number, scroll?: 'scroll') => {
		// We don't want to update the url state just because the UI is scrolling on the user's behalf.
		if (this.#isScrolling) return;
		this.setSearchParam('card', card1Indexed);

		if (scroll) {
			this.shouldScroll = true;
		}
	};

	acceptScrollRequest = (callback: (done: () => void) => unknown) => {
		this.shouldScroll = false;
		if (this.#isScrolling) return;
		callback(() => {
			this.#isScrolling = false;
		});
	};
})();
