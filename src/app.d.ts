// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			card?: number;
			runSheet?: boolean;
		}
		// interface Platform {}
	}
}

declare module 'dexie' {
	import { Subscriber, Unsubscriber } from 'svelte/store';
	import { Subscription } from 'dexie';
	interface Observable<T> {
		subscribe(run: Subscriber<T>): Unsubscriber | Subscription;
	}
}

export {};
