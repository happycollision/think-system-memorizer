#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Current directory path
const currentDir = __dirname;

// Path to the target fountain file
const fountainFilePath = path.join(
	__dirname,
	'../../src/routes/api/librettos/files/ComeFromAway.fountain'
);

// Function to get all .progress files and sort them naturally
function getProgressFiles() {
	const files = fs.readdirSync(currentDir);
	const progressFiles = files.filter((file) => file.endsWith('.progress.txt'));

	// Sort files naturally (chunk1, chunk2, ..., chunk5, chunk5a, chunk5b, chunk6, chunk7)
	return progressFiles.sort((a, b) => {
		// Extract the chunk number/identifier from filename
		const aMatch = a.match(/chunk(\d+[a-z]?)/);
		const bMatch = b.match(/chunk(\d+[a-z]?)/);

		if (aMatch && bMatch) {
			const aNum = parseInt(aMatch[1]);
			const bNum = parseInt(bMatch[1]);

			if (aNum === bNum) {
				// If numbers are the same, sort alphabetically (5a comes before 5b)
				return aMatch[1].localeCompare(bMatch[1]);
			}
			return aNum - bNum;
		}

		// Fallback to alphabetical sort
		return a.localeCompare(b);
	});
}

// Function to concatenate all progress files
function concatenateProgressFiles() {
	const progressFiles = getProgressFiles();
	let concatenatedContent = '';

	console.log(`Found ${progressFiles.length} progress files:`);

	progressFiles.forEach((file, index) => {
		const filePath = path.join(currentDir, file);
		console.log(`- ${file}`);

		try {
			const content = fs.readFileSync(filePath, 'utf8');

			// Add a separator between chunks (except for the first one)
			if (index > 0) {
				concatenatedContent += '\n\n';
			}

			concatenatedContent += content;
		} catch (error) {
			console.error(`Error reading file ${file}:`, error.message);
			process.exit(1);
		}
	});

	return concatenatedContent;
}

// Main function
function main() {
	console.log('Concatenating progress files...');

	try {
		// Get concatenated content
		const content = concatenateProgressFiles();

		// Write to the fountain file
		fs.writeFileSync(fountainFilePath, content, 'utf8');

		console.log(`\nSuccessfully wrote concatenated content to: ${fountainFilePath}`);
		console.log(`Total content length: ${content.length} characters`);
	} catch (error) {
		console.error('Error:', error.message);
		process.exit(1);
	}
}

// Run the script
main();
