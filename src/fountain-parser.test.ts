import { describe, beforeEach, it, expect, assert } from 'vitest';
import { FountainParser, type TitlePage } from './fountain-parser';

describe('FountainParser', () => {
	let parser: FountainParser;

	beforeEach(() => {
		parser = new FountainParser();
	});

	describe('Title Page Parsing', () => {
		it('should parse basic title page keys', () => {
			const script = `Title: My Awesome Movie
Credit: Written by
Author: A. N. Author
Source: Based on a true story
Draft Date: 01/01/2024`;
			const expectedTitlePage: TitlePage = {
				title: ['My Awesome Movie'],
				credit: ['Written by'],
				author: ['A. N. Author'],
				source: ['Based on a true story'],
				draft_date: ['01/01/2024']
			};
			const result = parser.parse(script);
			expect(result.title_page).toEqual(expectedTitlePage);
			expect(result.scenes.length).toBe(0);
		});

		it('should handle case-insensitivity and spaces in keys, normalizing them', () => {
			const script = `TITLE: Test Movie
Title Two: Another Title
My Custom Key: Value 1
my custom key: Value 2`;
			const result = parser.parse(script);
			expect(result.title_page.title).toEqual(['Test Movie']);
			expect(result.title_page.title_two).toEqual(['Another Title']);
			expect(result.title_page.my_custom_key).toEqual(['Value 1', 'Value 2']);
		});

		it('should handle multi-line values for the same key (multiple key instances)', () => {
			const script = `Authors: John Doe
Authors: Jane Smith`;
			const expectedTitlePage: TitlePage = {
				authors: ['John Doe', 'Jane Smith']
			};
			const result = parser.parse(script);
			expect(result.title_page).toEqual(expectedTitlePage);
		});

		it('should handle custom keys', () => {
			const script = `My Custom Key: Some Value`;
			const expectedTitlePage: TitlePage = {
				my_custom_key: ['Some Value']
			};
			const result = parser.parse(script);
			expect(result.title_page).toEqual(expectedTitlePage);
		});

		it('should stop parsing title page after a blank line followed by non-title content (action)', () => {
			const script = `Title: Test
Author: Me

This is action.`;
			const result = parser.parse(script);
			expect(result.title_page).toEqual({ title: ['Test'], author: ['Me'] });
			expect(result.scenes.length).toBe(1);
			expect(result.scenes[0].elements[0].type).toBe('action');
		});

		it('should stop parsing title page when a scene heading appears directly after title info', () => {
			const script = `Title: Test
Author: Me
INT. ROOM - DAY
This is action.`;
			const result = parser.parse(script);
			expect(result.title_page).toEqual({ title: ['Test'], author: ['Me'] });
			expect(result.scenes.length).toBe(1);
			expect(result.scenes[0].elements[0].type).toBe('scene_heading');
		});

		it('should handle title page ending and script starting with action', () => {
			const script = `Title: Test

This is an action line.`;
			const result = parser.parse(script);
			expect(result.title_page).toEqual({ title: ['Test'] });
			expect(result.scenes.length).toBe(1);
			assert(result.scenes[0].elements[0].type === 'action', 'Expected action type');
			expect(result.scenes[0].elements[0].text).toBe('This is an action line.');
		});

		it('should allow blank lines within title page if followed by more title keys', () => {
			const script = `Title: My Film

Author: Some One

Date: 2024`;
			const result = parser.parse(script);
			expect(result.title_page).toEqual({
				title: ['My Film'],
				author: ['Some One'],
				date: ['2024']
			});
			expect(result.scenes.length).toBe(0);
		});
	});

	describe('Scene Heading Parsing', () => {
		it('should parse INT. scene heading', () => {
			const script = `INT. KITCHEN - DAY`;
			const result = parser.parse(script);
			expect(result.scenes.length).toBe(1);
			const sceneHeading = result.scenes[0].elements[0];
			assert(sceneHeading.type === 'scene_heading', 'Expected scene heading type');
			expect(sceneHeading.setting).toBe('INT.');
			expect(sceneHeading.location).toBe('KITCHEN');
			expect(sceneHeading.time_of_day).toBe('DAY');
		});

		it('should parse EXT. scene heading with scene number', () => {
			const script = `EXT. PARK - NIGHT #1A#`;
			const result = parser.parse(script);
			const sceneHeading = result.scenes[0].elements[0];
			assert(sceneHeading.type === 'scene_heading', 'Expected scene heading type');
			expect(sceneHeading.setting).toBe('EXT.');
			expect(sceneHeading.location).toBe('PARK');
			expect(sceneHeading.time_of_day).toBe('NIGHT');
			expect(sceneHeading.scene_number).toBe('1A');
			expect(result.scenes[0].scene_number_token).toBe('1A');
		});

		it('should parse EST. scene heading', () => {
			const script = `EST. CITYSCAPE - DAWN`;
			const result = parser.parse(script);
			const sceneHeading = result.scenes[0].elements[0];
			assert(sceneHeading.type === 'scene_heading', 'Expected scene heading type');
			expect(sceneHeading.setting).toBe('EST.');
			expect(sceneHeading.location).toBe('CITYSCAPE');
			expect(sceneHeading.time_of_day).toBe('DAWN');
		});

		it('should parse I./E. scene heading', () => {
			const script = `I./E. SPACESHIP - DAY`;
			const result = parser.parse(script);
			const sceneHeading = result.scenes[0].elements[0];
			assert(sceneHeading.type === 'scene_heading', 'Expected scene heading type');
			expect(sceneHeading.setting).toBe('INT./EXT.');
			expect(sceneHeading.location).toBe('SPACESHIP');
			expect(sceneHeading.time_of_day).toBe('DAY');
		});

		it('should parse forced scene heading (starts with .)', () => {
			const script = `.THE BRIDGE`;
			const result = parser.parse(script);
			const sceneHeading = result.scenes[0].elements[0];
			assert(sceneHeading.type === 'scene_heading', 'Expected scene heading type');
			expect(sceneHeading.setting).toBe('OTHER');
			expect(sceneHeading.location).toBe('THE BRIDGE');
		});

		it('should parse forced scene heading with scene number', () => {
			const script = `.THE BRIDGE #2#`;
			const result = parser.parse(script);
			const sceneHeading = result.scenes[0].elements[0];
			assert(sceneHeading.type === 'scene_heading', 'Expected scene heading type');
			expect(sceneHeading.setting).toBe('OTHER');
			expect(sceneHeading.location).toBe('THE BRIDGE');
			expect(sceneHeading.scene_number).toBe('2');
		});

		it('should parse INT./EXT. scene heading', () => {
			const script = `INT./EXT. CAR - DAY`;
			const result = parser.parse(script);
			const sceneHeading = result.scenes[0].elements[0];
			assert(sceneHeading.type === 'scene_heading', 'Expected scene heading type');

			expect(sceneHeading.setting).toBe('INT./EXT.');
			expect(sceneHeading.location).toBe('CAR');
		});

		it('should parse scene heading with complex location and time', () => {
			const script = `INT. JOE'S GARAGE/WORKSHOP - NIGHT (LATER)`;
			const result = parser.parse(script);
			const sceneHeading = result.scenes[0].elements[0];
			assert(sceneHeading.type === 'scene_heading', 'Expected scene heading type');
			expect(sceneHeading.setting).toBe('INT.');
			expect(sceneHeading.location).toBe("JOE'S GARAGE/WORKSHOP");
			expect(sceneHeading.time_of_day).toBe('NIGHT (LATER)');
		});
	});

	describe('Scene Element Parsing', () => {
		it('should parse action', () => {
			const script = `INT. ROOM - DAY\n\nHe walks across the room.`;
			const result = parser.parse(script);
			assert(result.scenes[0].elements[1].type === 'action', 'Expected action type');
			expect(result.scenes[0].elements[1].text).toBe('He walks across the room.');
		});

		it('should parse multi-line action', () => {
			const script = `INT. ROOM - DAY\n\nHe walks.\nHe stops.`;
			const result = parser.parse(script);
			assert(result.scenes[0].elements[1].type === 'action', 'Expected action type');
			expect(result.scenes[0].elements[1].text).toBe('He walks.\nHe stops.');
		});

		it('should parse character and dialogue', () => {
			const script = `INT. ROOM - DAY\n\nBOB\nHello there.`;
			const result = parser.parse(script);
			assert(result.scenes[0].elements[1].type === 'character', 'Expected character type');
			expect(result.scenes[0].elements[1].name).toBe('BOB');
			assert(result.scenes[0].elements[2].type === 'dialogue', 'Expected dialogue type');
			expect(result.scenes[0].elements[2].text).toBe('Hello there.');
		});

		it('should parse character with (V.O.) and dialogue', () => {
			const script = `NARRATOR (V.O.)\nOnce upon a time...`;
			const result = parser.parse(script);
			assert(result.scenes[0].elements[0].type === 'character', 'Expected character type');
			expect(result.scenes[0].elements[0].name).toBe('NARRATOR (V.O.)');
			assert(result.scenes[0].elements[1].type === 'dialogue', 'Expected dialogue type');
			expect(result.scenes[0].elements[1].text).toBe('Once upon a time...');
		});

		it('should parse character with (O.S.) and dialogue', () => {
			const script = `GUARD (O.S.)\nWho goes there?`;
			const result = parser.parse(script);
			assert(result.scenes[0].elements[0].type === 'character', 'Expected character type');
			expect(result.scenes[0].elements[0].name).toBe('GUARD (O.S.)');
			expect(result.scenes[0].elements[1].type).toBe('dialogue');
		});

		it('should parse dialogue with parenthetical', () => {
			const script = `BOB\n(sarcastically)\nI love this.`;
			const result = parser.parse(script);
			expect(result.scenes[0].elements[0].type).toBe('character');
			assert(result.scenes[0].elements[1].type === 'parenthetical', 'Expected parenthetical type');
			expect(result.scenes[0].elements[1].text).toBe('(sarcastically)');
			assert(result.scenes[0].elements[2].type === 'dialogue', 'Expected dialogue type');
			expect(result.scenes[0].elements[2].text).toBe('I love this.');
		});

		it('should parse multi-line dialogue', () => {
			const script = `ALICE\nThis is the first line.\nThis is the second line.`;
			const result = parser.parse(script);
			assert(result.scenes[0].elements[1].type === 'dialogue', 'Expected dialogue type');
			expect(result.scenes[0].elements[1].text).toBe(
				'This is the first line.\nThis is the second line.'
			);
		});

		it('should parse transitions ending with TO:', () => {
			const script = `CUT TO:`;
			const result = parser.parse(script);
			assert(result.scenes[0].elements[0].type === 'transition', 'Expected transition type');
			expect(result.scenes[0].elements[0].text).toBe('CUT TO:');
		});

		it('should parse transitions starting with >', () => {
			const script = `> transition text`;
			const result = parser.parse(script);
			assert(result.scenes[0].elements[0].type === 'transition', 'Expected transition type');
			expect(result.scenes[0].elements[0].text).toBe('> transition text');
		});

		it('should parse centered text as action', () => {
			const script = `>THE END<`; // Does not end with TO:
			const result = parser.parse(script);
			assert(result.scenes[0].elements[0].type === 'action', 'Expected action type');
			expect(result.scenes[0].elements[0].text).toBe('THE END');
			expect(result.scenes[0].elements[0].isCentered).toBe(true);
		});

		it('should parse notes', () => {
			const script = `[[This is a note.]]`;
			const result = parser.parse(script);
			assert(result.scenes[0].elements[0].type === 'note', 'Expected note type');
			expect(result.scenes[0].elements[0].text).toBe('This is a note.');
		});

		it('should parse lyrics', () => {
			const script = `~Row, row, row your boat`;
			const result = parser.parse(script);
			assert(result.scenes[0].elements[0].type === 'lyric', 'Expected lyric type');
			expect(result.scenes[0].elements[0].text).toBe('Row, row, row your boat');
		});

		it('should parse section markers (# Section)', () => {
			const script = `# My Section\n\nThis is action.`;
			const result = parser.parse(script);
			assert(result.scenes[0].elements[0].type === 'section', 'Expected section type');
			expect(result.scenes[0].elements[0].level).toBe(1);
			expect(result.scenes[0].elements[0].text).toBe('My Section');
			assert(result.scenes[0].elements[1].type === 'action', 'Expected section type');
			expect(result.scenes[0].elements[1].text).toBe('This is action.');
		});

		it('should parse synopsis (= Synopsis) ', () => {
			const script = `= An overview.\n\nThis is action.`;
			const result = parser.parse(script);
			assert(result.scenes[0].elements[0].type === 'synopsis', 'Expected synopsis type');
			expect(result.scenes[0].elements[0].text).toBe('An overview.');
			assert(result.scenes[0].elements[1].type === 'action', 'Expected action type');
			expect(result.scenes[0].elements[1].text).toBe('This is action.');
		});

		it('should parse an all-caps line not followed by dialogue/parenthetical as action', () => {
			const script = `INT. ROOM - DAY\n\nA LOUD BANG.`;
			const result = parser.parse(script);
			expect(result.scenes[0].elements.length).toBe(2);
			assert(result.scenes[0].elements[1].type === 'action', 'Expected action type');
			expect(result.scenes[0].elements[1].text).toBe('A LOUD BANG.');
		});
	});

	describe('Full Script Parsing', () => {
		it('should parse a script with title page and multiple scenes', () => {
			const script = `Title: My Life
Author: Me

INT. HOUSE - DAY
Action one.

BOB
(shouting)
Hello!

EXT. GARDEN - NIGHT
Action two.
FADE TO BLACK.`;
			const result = parser.parse(script);
			expect(result.title_page).toEqual({ title: ['My Life'], author: ['Me'] });
			expect(result.scenes.length).toBe(2);

			// Scene 1
			assert(result.scenes[0].elements[0].type === 'scene_heading', 'Expected scene heading type');
			expect(result.scenes[0].elements[0].location).toBe('HOUSE');
			assert(result.scenes[0].elements[1].type === 'action', 'Expected action type');
			expect(result.scenes[0].elements[1].text).toBe('Action one.');
			assert(result.scenes[0].elements[2].type === 'character', 'Expected character type');
			expect(result.scenes[0].elements[2].name).toBe('BOB');
			assert(result.scenes[0].elements[3].type === 'parenthetical', 'Expected parenthetical type');
			expect(result.scenes[0].elements[3].text).toBe('(shouting)');
			assert(result.scenes[0].elements[4].type === 'dialogue', 'Expected dialogue type');
			expect(result.scenes[0].elements[4].text).toBe('Hello!');

			// Scene 2
			assert(result.scenes[1].elements[0].type === 'scene_heading', 'Expected scene heading type');
			expect(result.scenes[1].elements[0].location).toBe('GARDEN');
			assert(result.scenes[1].elements[1].type === 'action', 'Expected action type');
			expect(result.scenes[1].elements[1].text).toBe('Action two.');
			assert(result.scenes[1].elements[2].type === 'transition', 'Expected transition type');
			expect(result.scenes[1].elements[2].text).toBe('FADE TO BLACK.');
		});

		it('should handle script starting directly with action', () => {
			const script = `This is the very first line of action.
Followed by more action.`;
			const result = parser.parse(script);
			expect(result.title_page).toEqual({});
			expect(result.scenes.length).toBe(1);
			expect(result.scenes[0].elements.length).toBe(1);
			assert(result.scenes[0].elements[0].type === 'action', 'Expected action type');
			expect(result.scenes[0].elements[0].text).toBe(
				'This is the very first line of action.\nFollowed by more action.'
			);
		});

		it('should correctly handle dialogue continuation after parenthetical', () => {
			const script = `CHARACTER
(to himself)
This is dialogue.
Still dialogue.`;
			const result = parser.parse(script);
			expect(result.scenes[0].elements.length).toBe(3);
			expect(result.scenes[0].elements[0].type).toBe('character');
			expect(result.scenes[0].elements[1].type).toBe('parenthetical');
			assert(result.scenes[0].elements[2].type === 'dialogue', 'Expected dialogue type');
			expect(result.scenes[0].elements[2].text).toBe('This is dialogue.\nStill dialogue.');
		});

		it("should handle character (CONT'D)", () => {
			const script = `JOHN (CONT'D)\nI am still talking.`;
			const result = parser.parse(script);
			assert(result.scenes[0].elements[0].type === 'character', 'Expected character type');
			expect(result.scenes[0].elements[0].name).toBe("JOHN (CONT'D)");
			expect(result.scenes[0].elements[1].type).toBe('dialogue');
		});

		it('should parse an empty script', () => {
			const script = ``;
			const result = parser.parse(script);
			expect(result.title_page).toEqual({});
			expect(result.scenes).toEqual([]);
		});

		it('should parse script with only blank lines', () => {
			const script = `\n\n\n`;
			const result = parser.parse(script);
			expect(result.title_page).toEqual({});
			expect(result.scenes).toEqual([]);
		});

		it('should correctly distinguish character names from all-caps action lines', () => {
			const script = `INT. OFFICE - DAY

THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.

JANE
(Smiling)
Did you see that?

THE CEO ENTERS.

CEO
What's all this commotion?`;

			const result = parser.parse(script);
			expect(result.scenes.length).toBe(1);
			const elements = result.scenes[0].elements;

			expect(elements[0].type).toBe('scene_heading');

			assert(elements[1].type === 'action', 'Expected action type');
			expect(elements[1].text).toBe('THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.');

			assert(elements[2].type === 'character', 'Expected character type');
			expect(elements[2].name).toBe('JANE');
			expect(elements[3].type).toBe('parenthetical');
			expect(elements[4].type).toBe('dialogue');

			assert(elements[5].type === 'action', 'Expected action type');
			expect(elements[5].text).toBe('THE CEO ENTERS.');

			assert(elements[6].type === 'character', 'Expected character type');
			expect(elements[6].name).toBe('CEO');
			expect(elements[7].type).toBe('dialogue');
		});
	});
});
