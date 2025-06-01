import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateId, librettos } from '../devStore.svelte';
import type { Libretto } from '../../librettos.json/+server';

export const prerender = false;

export const POST: RequestHandler = async ({ request }) => {
	const { title, content }: Omit<Libretto, 'id'> = await request.json();

	if (!title || !content) {
		return json({ error: 'Title and content are required' }, { status: 400 });
	}

	if (librettos.current.some((l) => l.title === title)) {
		return json({ error: `Libretto with title "${title}" already exists` }, { status: 409 });
	}

	const newLibretto: Libretto = { id: generateId(), title, content };
	librettos.current = [...librettos.current, newLibretto];
	return json(newLibretto, { status: 201 });
};
