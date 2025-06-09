import fs from 'fs';
import path from 'path';
import { FountainParser, type Screenplay } from '../../../fountain-parser'; // Adjusted path
import { error as err } from '@sveltejs/kit';

const dict = {
	diamonds: 'Diamonds.txt',
	away: 'ComeFromAway.fountain'
};

export async function load(ctx) {
	const slug = ctx.params.slug;
	const file = dict[slug as keyof typeof dict];
	if (!file) {
		err(404, new Error(`Script with slug "${slug}" not found.`));
	}
	const filePath = path.resolve(process.cwd(), `src/routes/api/librettos/files/${file}`); // Ensure correct path from project root
	let screenplay: Screenplay | null = null;
	let error: string | null = null;

	try {
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		const parser = new FountainParser();
		screenplay = parser.parse(fileContent);
	} catch (e) {
		console.error('Error loading or parsing screenplay:', e);
		error =
			(e as Error | { message?: never })?.message || 'Failed to load or parse script at ${slug}.';

		err(500, new Error(error));
	}

	return {
		screenplay
	};
}
