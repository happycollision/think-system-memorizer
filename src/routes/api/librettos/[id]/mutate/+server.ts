import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Libretto } from '../../../librettos.json/+server';
import { librettos } from '../../devStore.svelte';

export const prerender = false;

// Import the librettos array (in a real app, this would be a database)
// For now, we'll need to share state - in production use a proper database

export const PUT: RequestHandler = async ({ params, request }) => {
	const updatedLibretto: Libretto = await request.json();
	const index = librettos.current.findIndex((l) => l.id === params.id);

	if (index === -1) {
		throw error(404, 'Libretto not found');
	}

	// Ensure the ID remains the same
	updatedLibretto.id = params.id;
	librettos.current[index] = updatedLibretto;
	return json(librettos.current[index]);
};

export const DELETE: RequestHandler = async ({ params }) => {
	console.log(
		'starting librettos',
		librettos.current.map((l) => l.id)
	);
	const index = librettos.current.findIndex((l) => l.id === params.id);

	if (index === -1) {
		throw error(404, 'Libretto not found');
	}

	librettos.current = librettos.current.filter((l) => l.id !== params.id);
	console.log(`Deleted libretto with ID: ${params.id}`);
	console.log(librettos.current);
	return json({ success: true });
};
