import { base } from '$app/paths';
import type { Libretto } from '../api/librettos.json/+server';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch(`${base}/api/librettos.json`);
	const librettos: Libretto[] = await response.json();

	return {
		librettos,
		fountain: [{ id: 'away', title: 'Come From Away', content: '' }] satisfies Libretto[]
	};
};
