import fs from 'fs';
import path from 'path';
import { FountainParser, type Screenplay } from '../../../fountain-parser'; // Adjusted path

export async function load() {
	const filePath = path.resolve(process.cwd(), 'src/routes/api/librettos/files/Diamonds.txt'); // Ensure correct path from project root
	let screenplay: Screenplay | null = null;
	let error: string | null = null;

	try {
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		const parser = new FountainParser();
		screenplay = parser.parse(fileContent);
	} catch (e: any) {
		console.error('Error loading or parsing screenplay:', e);
		error = e.message || 'Failed to load or parse screenplay.';
	}

	return {
		screenplay,
		error
	};
}
