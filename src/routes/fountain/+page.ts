import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

export async function load() {
	redirect(303, `${base}/librettos`);
}
