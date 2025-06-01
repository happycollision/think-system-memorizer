import type { Libretto } from '../librettos.json/+server';

export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function reproducibleRandom(seed: number): () => number {
	return () => {
		const x = Math.sin(seed++) * 10000;
		return x - Math.floor(x);
	};
}

const randomNumberViaSeed = reproducibleRandom(1234);

function generateIdWithSeed(): string {
	return randomNumberViaSeed().toString(36).substring(2);
}

const imports = import.meta.glob('./files/*.txt', {
	query: 'raw',
	import: 'default',
	eager: true
});

const localLibs = Object.entries(imports).map(([local, fromSrc]) => ({
	id: generateIdWithSeed(),
	title: local.split('/').pop()?.replace('.txt', '') || 'Untitled',
	content: fromSrc
})) as Libretto[];

export const librettos: { current: Libretto[] } = $state({ current: localLibs });
