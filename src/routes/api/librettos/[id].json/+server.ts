import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { librettos } from '../devStore.svelte';

// Import the librettos array (in a real app, this would be a database)
// For now, we'll need to share state - in production use a proper database

export const GET: RequestHandler = async ({ params }) => {
	const libretto = librettos.current.find((l) => l.id === params.id);
	if (!libretto) {
		throw error(404, 'Libretto not found');
	}
	return json(libretto);
};
