import type { Libretto } from '../librettos.json/+server';

export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function reproducibleRandom(seed: number): () => number {
	return () => {
		const x = Math.sin(seed++) * 10000;
		return x - Math.floor(x);
	};
}

const randomNumberViaSeed = reproducibleRandom(1234);

function generateIdWithSeed(): string {
	return randomNumberViaSeed().toString(36).substring(2);
}

const imports = import.meta.glob('./files/*.{txt,fountain}', {
	query: 'raw',
	import: 'default',
	eager: true,
});

const characterHighlightDict: Record<string, Libretto['characterName']> = {
	ComeFromAway: {
		exact: [
			'CUSTOMS OFFICERS',
			'TENOR MEN',
			'ALL MEN',
			'MEN',
			"MEN (CONT'D)",
			'COMPANY',
			'ALL',
			'ALL (UNLESS SPEAKING)',
		],
		approximate: ['OZ', 'JOEY', 'MICHAELS', 'TERRY', 'RABBI', 'MATTY', 'CARDIOLOGIST', '7'],
	},
	Tosha: {
		approximate: ['TOSHA'],
	},
	KillersOfTheFlowerMoon: {
		approximate: ['ERNEST'],
	},
};

const localLibs = Object.entries(imports).map(([local, fromSrc]) => {
	const isFountain = local.includes('fountain');
	const title =
		local
			.split('/')
			.pop()
			?.replace(/\.(txt|fountain)/, '') || 'Untitled';
	const characters = characterHighlightDict[title];

	return {
		id: generateIdWithSeed(),
		title:
			local
				.split('/')
				.pop()
				?.replace(/\.(txt|fountain)/, '') || 'Untitled',
		content: fromSrc,
		isFountain,
		characterName: characters,
	};
}) as Libretto[];

const ComeFromAway = localLibs.findIndex((x) => x.title === 'ComeFromAway');
localLibs.splice(ComeFromAway + 1, 0, {
	...localLibs[ComeFromAway],
	title: 'ComeFromAway2',
	id: generateIdWithSeed(),
	characterName: {
		exact: ['CUSTOMS OFFICERS'],
		approximate: ['OZ', 'JOEY', 'MICHAELS', 'TERRY', 'RABBI', 'MATTY', 'CARDIOLOGIST', '7'],
	},
});

export const librettos: { current: Libretto[] } = $state({ current: localLibs });
