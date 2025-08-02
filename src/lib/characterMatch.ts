import type { Libretto } from '../routes/api/librettos.json/+server';

export function characterMatch(
	characterName: Libretto['characterName'],
	speaking: string | undefined,
): boolean {
	if (!characterName || !speaking) return false;
	return (
		characterName.exact?.some((c) => c.toLowerCase() === speaking.toLowerCase()) ||
		characterName.approximate?.some((c) => speaking.toLowerCase().includes(c.toLowerCase())) ||
		false
	);
}
