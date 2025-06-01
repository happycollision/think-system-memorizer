import { base } from '$app/paths';
import type { Libretto } from '../../api/librettos.json/+server.js';

export async function load({ params: { id }, fetch }) {
	const libretto = await fetch(`${base}/api/librettos/${id}.json`).then(
		(res) => res.json() as Promise<Libretto>
	);

	return { libretto };
}
