import { base } from '$app/paths';

export async function load({ params: { title }, fetch }) {
	const text = await fetch(`${base}/files/${title}.txt`).then((res) => res.text());

	return { text };
}
