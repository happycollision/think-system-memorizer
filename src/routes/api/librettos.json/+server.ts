import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { librettos } from '../librettos/devStore.svelte';

export type Libretto = { id: string; title: string; content: string };

export const GET: RequestHandler = async () => {
	return json(librettos.current);
};
