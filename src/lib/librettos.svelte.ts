import { browser } from '$app/environment';

export type Libretto = { title: string; content: string };

// Create reactive state
let librettos = $state<Libretto[]>([]);

export function load() {
	if (browser) {
		const stored = localStorage.getItem('libretto-collection');
		if (stored) {
			librettos = JSON.parse(stored);
		}
	}
}

function update() {
	if (browser) {
		localStorage.setItem('libretto-collection', JSON.stringify(librettos));
	}
}

load();

export function add(libretto: Libretto) {
	if (librettos.some((l) => l.title === libretto.title)) {
		throw new Error(`Libretto with title "${libretto.title}" already exists.`);
	}
	librettos = [...librettos, libretto];
	update();
}

export function updateLibretto(title: string, content: string) {
	const index = librettos.findIndex((l) => l.title === title);
	if (index === -1) {
		throw new Error(`Libretto with title "${title}" not found.`);
	}
	librettos[index] = { title, content };
	update();
}

export function remove(title: string) {
	librettos = librettos.filter((l) => l.title !== title);
	update();
}

export function getAll() {
	return librettos;
}
