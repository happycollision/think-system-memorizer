export interface TitlePage {
	title?: string[];
	credit?: string[];
	author?: string[];
	authors?: string[];
	source?: string[];
	notes?: string[];
	draft_date?: string[];
	date?: string[];
	contact?: string[];
	copyright?: string[];
	[key: string]: string[] | undefined; // For other custom key-value pairs
}

export interface Action {
	type: 'action';
	text: string;
	isCentered?: boolean;
}

export interface Character {
	type: 'character';
	name: string;
}

export interface Dialogue {
	type: 'dialogue';
	text: string;
}

export interface Parenthetical {
	type: 'parenthetical';
	text: string;
}

export interface Transition {
	type: 'transition';
	text: string;
}

export interface SceneHeading {
	type: 'scene_heading';
	text: string;
	setting: 'INT.' | 'EXT.' | 'EST.' | 'INT./EXT.' | 'OTHER'; // OTHER for forced headings like .LOCATION
	location: string;
	time_of_day?: string;
	scene_number?: string;
}

export interface Note {
	type: 'note';
	text: string;
}

export interface Lyric {
	type: 'lyric';
	text: string;
}

export type SceneElement =
	| Action
	| Character
	| Dialogue
	| Parenthetical
	| Transition
	| SceneHeading
	| Note
	| Lyric;

export interface Scene {
	scene_number_token?: string; // e.g. #1#, ##, from scene heading or standalone line
	elements: SceneElement[];
}

export interface Screenplay {
	title_page: TitlePage;
	scenes: Scene[];
}

const REGEX = {
	TITLE_PAGE_KEY: /^([A-Za-z\s_]+):\s*(.*)/,
	// Groups: 1=INT./EXT./EST./I./E. 2=INT/EXT etc. 3=Location 4=Time of Day 5=Scene Number
	SCENE_HEADING:
		/^(?:(?:(INT\.|EXT\.|EST\.|I\.?\/E\.?)(?:\.?\s*))|(?:(INT\/EXT|INT\.EXT|EXT\.INT)\.?\s*))?([A-Z0-9 \t.\-/()]+?)(?:[ \t]+-\s*([A-Z0-9 \t\-()]+))?(?:\s*(#.*?#))?$/i,
	FORCED_SCENE_HEADING: /^\.(.+?)(?:\s*(#.*?#))?$/, // Starts with a period. Groups: 1=Location 2=SceneNumber
	SCENE_NUMBER_ONLY: /^\s*(#.*?#)\s*$/,
	TRANSITION:
		/^(?:FADE (?:TO BLACK|OUT|IN)|CUT TO BLACK|SMASH CUT TO|MATCH CUT TO|JUMP CUT TO|IRIS (?:IN|OUT)|WIPE TO|CONTINUOUS|BACK TO SCENE|TIME CUT)(?:\.)?$|^>?\s*([A-Z][A-Z0-9 \t]+TO:)$|^>\s*([^<]+?)\s*<$/i,
	CHARACTER_CUE:
		/^[ \t]*([A-Z0-9][A-Z0-9 \t()\-.'"]*(?:\s*\(V\.O\.\)|\s*\(O\.S\.\)|\s*\(O\.S\.C\.\)|\s*\(CONT'D\))?)(?:\s*\^)?$/, // O.S.C. for Off-Screen Character
	PARENTHETICAL: /^[ \t]*(\(.+\))$/,
	// ACTION: /^[ \t]*!?(.*)/, // ! for action, or just normal text - handled by isAction
	CENTERED_ACTION: /^[ \t]*>(.*)<(?!\w)/, // > TEXT < but not a transition like > SOMETHING TO:
	NOTE: /^\[\[\s*(.*?)\s*\]\]$/,
	LYRIC: /^~(.*)/,
	SECTION_MARKER: /^#+\s*(.+)/, // # Section, ## Subsection
	SYNOPSIS: /^=\s*(.*)/, // = Synopsis
	BLANK_LINE: /^\s*$/
};

function isPotentialCharacter(line: string): boolean {
	const trimmedLine = line.trim();
	if (!trimmedLine || trimmedLine.length === 0) return false;
	if (trimmedLine.startsWith('.') || trimmedLine.startsWith('>') || trimmedLine.endsWith('<'))
		return false; // common scene/transition markers
	// Explicitly check against scene heading patterns, case-insensitively for the prefix
	if (/^(INT\.|EXT\.|EST\.|I\.?\/E\.?)/i.test(trimmedLine)) return false;
	if (REGEX.SCENE_HEADING.test(trimmedLine)) return false; // Check full pattern
	if (REGEX.FORCED_SCENE_HEADING.test(trimmedLine)) return false;
	if (REGEX.TRANSITION.test(trimmedLine)) return false;
	if (REGEX.NOTE.test(trimmedLine)) return false;
	if (REGEX.LYRIC.test(trimmedLine)) return false;
	if (REGEX.SECTION_MARKER.test(trimmedLine)) return false;
	if (REGEX.SYNOPSIS.test(trimmedLine)) return false;
	if (REGEX.PARENTHETICAL.test(trimmedLine)) return false;
	if (REGEX.CENTERED_ACTION.test(trimmedLine)) return false;

	// Check if the line is mostly uppercase, allowing for (V.O.), (O.S.), etc.
	// and does not end with ' TO:' which is a transition
	if (trimmedLine.endsWith(' TO:')) return false;

	return REGEX.CHARACTER_CUE.test(trimmedLine);
}

export class FountainParser {
	private lines: string[] = [];
	private currentLineNum: number = 0;
	private screenplay: Screenplay = { title_page: {}, scenes: [] };
	private lastElementType: SceneElement['type'] | 'title_page_key' | null = null;

	private peek(): string | null {
		return this.currentLineNum < this.lines.length ? this.lines[this.currentLineNum] : null;
	}

	private advance(): string | null {
		const line = this.peek();
		if (line !== null) {
			this.currentLineNum++;
		}
		return line;
	}

	private addTitlePageProperty(key: string, value: string) {
		const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
		if (!this.screenplay.title_page[normalizedKey]) {
			this.screenplay.title_page[normalizedKey] = [];
		}
		this.screenplay.title_page[normalizedKey]!.push(value.trim());
		this.lastElementType = 'title_page_key';
	}

	private parseTitlePage(): void {
		let line = this.peek();
		let foundTitlePageElement = false;
		let blankLineFollowsTitleElement = false;

		while (line !== null) {
			if (REGEX.BLANK_LINE.test(line)) {
				this.advance();
				if (foundTitlePageElement) {
					blankLineFollowsTitleElement = true; // Mark that a blank line appeared after some title content
				}
				line = this.peek();
				continue;
			}

			const titleMatch = line.match(REGEX.TITLE_PAGE_KEY);
			if (titleMatch) {
				// If a blank line was encountered after a title element, and now we see another title element,
				// it means the blank line was part of the title page content (e.g. separating authors)
				blankLineFollowsTitleElement = false;
				this.addTitlePageProperty(titleMatch[1], titleMatch[2]);
				foundTitlePageElement = true;
				this.advance();
			} else {
				// If we found title elements, and now encounter a non-blank, non-title-key line:
				// - If a blank line immediately preceded this, title page is over.
				// - Or, if this line looks like a scene heading or action, title page is over.
				if (
					foundTitlePageElement &&
					(blankLineFollowsTitleElement ||
						REGEX.SCENE_HEADING.test(line) ||
						REGEX.FORCED_SCENE_HEADING.test(line) ||
						this.isAction(line, false))
				) {
					break;
				}
				// If no title page elements found yet, or current line is not a key:value,
				// and not a scene/action, it might be a multi-line value for the *previous* key.
				// For simplicity, this parser assumes title page elements are single `Key: Value` lines.
				// Any non-matching line after the first title key, or any line if no keys found, ends title page parsing.
				if (
					foundTitlePageElement ||
					this.isAction(line, false) ||
					REGEX.SCENE_HEADING.test(line) ||
					REGEX.FORCED_SCENE_HEADING.test(line)
				) {
					break;
				}
				// If nothing found and not a scene/action, this line itself might be the start of the script.
				break;
			}
			line = this.peek();
		}
	}

	private isAction(line: string, inSceneContext: boolean): boolean {
		if (REGEX.BLANK_LINE.test(line)) return false;
		if (REGEX.SCENE_HEADING.test(line)) return false;
		if (REGEX.FORCED_SCENE_HEADING.test(line)) return false;
		if (REGEX.SCENE_NUMBER_ONLY.test(line) && !inSceneContext) return false; // Scene number alone isn't action if not in scene
		if (REGEX.TRANSITION.test(line.trim())) return false;
		if (isPotentialCharacter(line)) return false;
		if (REGEX.PARENTHETICAL.test(line)) return false;
		if (REGEX.NOTE.test(line)) return false;
		if (REGEX.LYRIC.test(line)) return false;
		if (REGEX.SECTION_MARKER.test(line)) return false;
		if (REGEX.SYNOPSIS.test(line)) return false;
		if (REGEX.CENTERED_ACTION.test(line)) return false;
		// If it's a title page key, it's not action (unless we are past title page parsing)
		if (!inSceneContext && REGEX.TITLE_PAGE_KEY.test(line)) return false;
		return true;
	}

	private parseSceneElements(currentScene: Scene): void {
		let line = this.peek();

		while (line !== null) {
			const trimmedLine = line.trim();

			if (REGEX.BLANK_LINE.test(line)) {
				this.advance();
				this.lastElementType = null; // Reset context on blank line
				line = this.peek();
				continue;
			}

			// Check for new scene heading or transition that might end current scene's elements
			if (REGEX.SCENE_HEADING.test(line) || REGEX.FORCED_SCENE_HEADING.test(line)) {
				break; // New scene starts, end current scene element parsing
			}
			// Scene number on its own line might also indicate a break or belong to current scene if first
			if (REGEX.SCENE_NUMBER_ONLY.test(trimmedLine)) {
				if (currentScene.elements.length === 0 && !currentScene.scene_number_token) {
					currentScene.scene_number_token = trimmedLine;
					this.advance();
					line = this.peek();
					this.lastElementType = null; // Or a specific type for scene number if defined
					continue;
				} else {
					break; // Assume it's for a new scene or a break
				}
			}

			let match;

			if (REGEX.NOTE.test(line)) {
				match = line.match(REGEX.NOTE);
				currentScene.elements.push({ type: 'note', text: match![1].trim() });
				this.lastElementType = 'note';
			} else if (REGEX.LYRIC.test(line)) {
				match = line.match(REGEX.LYRIC);
				currentScene.elements.push({ type: 'lyric', text: match![1] });
				this.lastElementType = 'lyric';
			} else if (REGEX.TRANSITION.test(trimmedLine)) {
				currentScene.elements.push({ type: 'transition', text: trimmedLine });
				this.lastElementType = 'transition';
			} else if (REGEX.CENTERED_ACTION.test(line)) {
				match = line.match(REGEX.CENTERED_ACTION);
				currentScene.elements.push({ type: 'action', text: match![1].trim(), isCentered: true });
				this.lastElementType = 'action';
			} else if (isPotentialCharacter(line)) {
				currentScene.elements.push({ type: 'character', name: trimmedLine });
				this.lastElementType = 'character';
			} else if (
				REGEX.PARENTHETICAL.test(line) &&
				(this.lastElementType === 'character' ||
					this.lastElementType === 'parenthetical' ||
					this.lastElementType === 'dialogue')
			) {
				match = line.match(REGEX.PARENTHETICAL);
				currentScene.elements.push({ type: 'parenthetical', text: match![1] }); // Keep inner content as is, trim later if needed
				this.lastElementType = 'parenthetical';
			} else if (
				this.lastElementType === 'character' ||
				this.lastElementType === 'parenthetical' ||
				this.lastElementType === 'dialogue'
			) {
				// Potential dialogue line
				// Check if it's not any other element type that could interrupt dialogue
				if (
					!REGEX.BLANK_LINE.test(line) &&
					!REGEX.SCENE_HEADING.test(line) &&
					!REGEX.FORCED_SCENE_HEADING.test(line) &&
					!REGEX.TRANSITION.test(trimmedLine) &&
					!isPotentialCharacter(line) &&
					!REGEX.NOTE.test(line) &&
					!REGEX.LYRIC.test(line) &&
					!REGEX.SECTION_MARKER.test(line) &&
					!REGEX.SYNOPSIS.test(line) &&
					!REGEX.CENTERED_ACTION.test(line) &&
					!REGEX.PARENTHETICAL.test(line) // Dialogue doesn't consume new parentheticals
				) {
					let dialogueText = trimmedLine;
					this.advance();
					line = this.peek();
					// Collect multi-line dialogue
					while (
						line !== null &&
						!REGEX.BLANK_LINE.test(line) &&
						!REGEX.SCENE_HEADING.test(line) &&
						!REGEX.FORCED_SCENE_HEADING.test(line) &&
						!REGEX.TRANSITION.test(line.trim()) &&
						!isPotentialCharacter(line) &&
						!REGEX.NOTE.test(line) &&
						!REGEX.LYRIC.test(line) &&
						!REGEX.SECTION_MARKER.test(line) &&
						!REGEX.SYNOPSIS.test(line) &&
						!REGEX.CENTERED_ACTION.test(line) &&
						!REGEX.PARENTHETICAL.test(line)
					) {
						dialogueText += '\n' + line.trim();
						this.advance();
						line = this.peek();
					}
					currentScene.elements.push({ type: 'dialogue', text: dialogueText });
					this.lastElementType = 'dialogue';
					continue; // Already advanced, restart loop with new line
				} else {
					// Line looks like something else, not dialogue. Let the main loop re-evaluate.
					// This means the character's speech block has ended.
					// Fall through to action or other classifications.
					if (this.isAction(line, true)) {
						// Fallthrough to action, handled below
					} else {
						// If it's not action and not dialogue, it might be an unhandled case or a formatting issue.
						// For robustness, we'll advance to prevent infinite loops if no rule consumes the line.
						// However, the isAction check should be the ultimate fallback for scene content.
						// If isAction is false, it means it's a specific type that wasn't handled in context,
						// or it's a blank line (handled at top).
						// This path should ideally not be hit if logic is complete.
					}
				}
			}

			// If we are here, the line was not consumed by specific rules above or by dialogue logic.
			// It's either action or something that should end the scene (handled by loop start).
			if (this.isAction(line, true)) {
				let actionText = trimmedLine;
				this.advance(); // Consume current action line
				line = this.peek();
				// Collect multi-line action
				while (line !== null && this.isAction(line, true) && !REGEX.BLANK_LINE.test(line)) {
					actionText += '\n' + line.trim();
					this.advance();
					line = this.peek();
				}
				currentScene.elements.push({ type: 'action', text: actionText });
				this.lastElementType = 'action';
				continue; // Already advanced, restart loop
			} else {
				// If it's not action and not handled above, it might be a blank line (handled at top)
				// or something that breaks the scene (handled at top).
				// If it's genuinely unclassified, advance to prevent infinite loop.
				// This usually means it's a line that should have been classified or is a format error.
				if (line !== null && !REGEX.BLANK_LINE.test(line)) {
					// Fallback: treat as unclassified action if nothing else fits.
					// This helps catch things like standalone parentheticals if not handled explicitly.
					currentScene.elements.push({ type: 'action', text: line.trim() });
					this.lastElementType = 'action';
				}
			}

			this.advance(); // Ensure progress if no other rule advanced
			line = this.peek();
		}
	}

	public parse(script: string): Screenplay {
		this.lines = script.split(/\r\n|\r|\n/);
		this.currentLineNum = 0;
		this.screenplay = { title_page: {}, scenes: [] };
		this.lastElementType = null;

		this.parseTitlePage();

		let currentScene: Scene | null = null;

		while (this.currentLineNum < this.lines.length) {
			const line = this.peek();
			if (line === null) break;

			const trimmedLine = line.trim();

			if (REGEX.BLANK_LINE.test(line)) {
				this.advance();
				this.lastElementType = null; // Reset context on blank line between major blocks
				continue;
			}

			let sceneMatch;
			let sceneHeadingText = '';
			let sceneSetting: SceneHeading['setting'] = 'OTHER';
			let sceneLocation = '';
			let sceneTimeOfDay: string | undefined = undefined;
			let sceneSceneNumber: string | undefined = undefined;

			if ((sceneMatch = line.match(REGEX.FORCED_SCENE_HEADING))) {
				sceneHeadingText = trimmedLine;
				sceneLocation = sceneMatch[1].trim();
				sceneSceneNumber = sceneMatch[2]?.trim();
			} else if ((sceneMatch = line.match(REGEX.SCENE_HEADING))) {
				sceneHeadingText = trimmedLine;
				const settingToken = sceneMatch[1] || sceneMatch[2];
				if (settingToken) {
					const upperToken = settingToken.toUpperCase();
					if (
						upperToken.startsWith('INT./EXT') ||
						upperToken.startsWith('I./E') ||
						upperToken.startsWith('INT.EXT') ||
						upperToken.startsWith('EXT.INT')
					) {
						sceneSetting = 'INT./EXT.';
					} else if (upperToken.startsWith('INT')) sceneSetting = 'INT.';
					else if (upperToken.startsWith('EXT')) sceneSetting = 'EXT.';
					else if (upperToken.startsWith('EST')) sceneSetting = 'EST.';
				} else {
					// Implicit scene heading (location only, possibly with time/number)
					// Fountain spec implies these are usually preceded by a blank line and not indented.
					// For simplicity, if it matches the structure but without INT/EXT, treat as OTHER or try to infer.
					// Our regex makes INT/EXT part optional, so sceneMatch[3] will be location.
					sceneSetting = 'OTHER'; // Or could be context-dependent
				}
				sceneLocation = sceneMatch[3].trim();
				sceneTimeOfDay = sceneMatch[4]?.trim();
				sceneSceneNumber = sceneMatch[5]?.trim();
			}

			if (sceneHeadingText) {
				// Matched a scene heading (forced or normal)
				currentScene = { elements: [], scene_number_token: sceneSceneNumber };
				this.screenplay.scenes.push(currentScene);

				const sceneHeadingElement: SceneHeading = {
					type: 'scene_heading',
					text: sceneHeadingText,
					setting: sceneSetting,
					location: sceneLocation,
					time_of_day: sceneTimeOfDay,
					scene_number: sceneSceneNumber
				};
				currentScene.elements.push(sceneHeadingElement);
				this.lastElementType = 'scene_heading';
				this.advance();
				this.parseSceneElements(currentScene);
			} else if (REGEX.SCENE_NUMBER_ONLY.test(trimmedLine)) {
				// Scene number on its own line. Could start a new "bare" scene.
				if (!currentScene || currentScene.elements.length > 0) {
					// If no current scene, or current scene has content
					currentScene = { elements: [], scene_number_token: trimmedLine };
					this.screenplay.scenes.push(currentScene);
				} else {
					// Current scene is empty, assign this number to it
					currentScene.scene_number_token = trimmedLine;
				}
				this.lastElementType = null; // Or a specific type for scene number
				this.advance();
				this.parseSceneElements(currentScene); // Parse elements for this (potentially new) scene
			} else {
				// Not a scene heading, not a blank line. Must be elements of a scene.
				// If no current scene exists (e.g. script starts with action), create a "bare" scene.
				if (!currentScene) {
					currentScene = { elements: [] };
					this.screenplay.scenes.push(currentScene);
				}
				this.parseSceneElements(currentScene);
			}
		}

		// Clean up empty scenes that might have been added speculatively
		this.screenplay.scenes = this.screenplay.scenes.filter(
			(scene) => scene.elements.length > 0 || scene.scene_number_token
		);

		return this.screenplay;
	}
}
