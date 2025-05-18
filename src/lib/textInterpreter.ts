import { markdown } from 'markdown';

function replaceDashes(str: string) {
	const FIND_DOUBLE_DASH = /--/g;
	const FIND_TRIPLE_DASH = /---/g;
	return str.replace(FIND_TRIPLE_DASH, '&mdash;').replace(FIND_DOUBLE_DASH, '&ndash;');
}

function markdownify(str: string) {
	return replaceDashes(markdown.toHTML(str));
}

export function makeParts(text: string) {
	// const regex = /^(?:(?!^>.*?:)[\s\S])+>.*?:.*$/gm;
	const regex = /[\S\s]*?^\s?>[\w\s.&/']{1,30}:[\s\S]*?(?:(?!^(?:[\w\s.&/']{1,30}:|#))[\S\s])+/gm; // switched to this for bridges
	let m;
	const a: Array<[string, string]> = [];
	function addSplitsToArray(match: string) {
		const [cue, ...lines] = match.split(/^>/m);
		a.push([
			htmlForMarkdownifiedCue(markdownify(cue)),
			htmlForMarkdownifiedLine(markdownify(lines.join('')))
		]);
	}

	while ((m = regex.exec(text)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === regex.lastIndex) {
			regex.lastIndex++;
		}

		// The result can be accessed through the `m`-variable.
		m.forEach(addSplitsToArray);
	}
	return a;
}

function wrapStageDirections(str: string) {
	return str.replace(/(.*?)(\(.*?\))(.*)|(.*)/, (full, before, directions, after, nothing) => {
		if (nothing)
			return nothing.trim().length ? ` <span class="dialogue">${nothing.trim()}</span> ` : nothing;

		let beforeHtml = '';
		let afterHtml = '';
		if (before) {
			beforeHtml = before.trim().length ? ` <span class="dialogue">${before}</span> ` : before;
		}
		if (after) {
			afterHtml = wrapStageDirections(after);
		}

		return `${beforeHtml} <span class="stage-directions">${directions.trim()}</span> ${afterHtml}`;
	});
}

function htmlForMarkdownifiedCue(str: string) {
	return htmlForMarkdownifiedLine(str, false);
}

function splitIntoNodes(str: string) {
	const nodes = [];
	const firstTagMatcher = /<(\w+?\d?).*?>/;
	while (str.length > 0) {
		str = str.trim();
		const [openingTag, firstTagName] = str.match(firstTagMatcher) as string[];
		const fullTagMatcher = new RegExp(`<${firstTagName}>[\\s\\S]*?<\\/${firstTagName}>`);
		const match = str.match(fullTagMatcher);
		if (!match) {
			if (openingTag.charAt(openingTag.length - 2) === '/') {
				// self-closing tag
				nodes.push(openingTag);
				str = str.slice(openingTag.length);
				continue;
			}
			console.warn('unexpectedly did not match an outer node...');
			return nodes;
		}
		str = str.slice(match[0].length);
		nodes.push(match[0]);
	}
	return nodes;
}

function htmlForMarkdownifiedLine(str: string, highlightDialogue = true) {
	const outerNodes = splitIntoNodes(str);
	const htmlAddedNodes = outerNodes.map((node) => {
		const isParagraph = node.match(/^<p/);
		if (!isParagraph) {
			return wrapStageDirections(node);
		}

		// eslint-disable-next-line prefer-const
		let [, open, character, dialogue, close] = node.match(
			/(<p>)([\w\s.&/;#']{1,38}:)?([\s\S]*?)(<\/p>)/
		) as string[];
		dialogue = wrapStageDirections(dialogue);
		character = character ? `<span class="character">${character}</span>` : '';
		if (highlightDialogue) {
			dialogue = `<span class="highlighted">${dialogue}</span>`;
		}
		return `${open}${character}${dialogue}${close}`;
	});
	return htmlAddedNodes.join('');
}
