import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export async function load() {
	redirect(303, `${base}/librettos`); // Redirect to the librettos page
}
