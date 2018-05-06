import {markdown} from 'markdown';

function replaceDashes(string) {
  const FIND_DOUBLE_DASH = /--/g;
  const FIND_TRIPLE_DASH = /---/g;
  return string
    .replace(FIND_TRIPLE_DASH, '&mdash;')
    .replace(FIND_DOUBLE_DASH, '&ndash;');
}

function markdownify(string) {
  return replaceDashes(markdown.toHTML(string));
}

export function makeParts (text) {
  // const regex = /^(?:(?!^>.*?:)[\s\S])+>.*?:.*$/gm;
  const regex = /[\S\s]*?^\s?>[\w\s.&/']{1,30}:[\s\S]*?(?:(?!^(?:[\w\s.&/']{1,30}:|#))[\S\s])+/gm // switched to this for bridges
  let m;
  let a = [];
  function addSplitsToArray (match) {
    const [cue, ...lines] = match.split(/^>/m);
    a.push([
      htmlForMarkdownifiedCue(markdownify(cue)),
      htmlForMarkdownifiedLine(markdownify(lines.join('')))
    ]);
  }

  // eslint-disable-next-line
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

function wrapStageDirections(str) {
  return str.replace(/\(.*?\)/g, (substr) => `<span class="stage-directions">${substr}</span>`);
}

function htmlForMarkdownifiedCue(str) {
  return htmlForMarkdownifiedLine(str, false);
}

function splitIntoNodes(str) {
  const nodes = [];
  const firstTagMatcher = /<(\w+?\d?).*?>/;
  while (str.length > 0) {
    str = str.trim();
    const [openingTag, firstTagName] = str.match(firstTagMatcher);
    const fullTagMatcher = new RegExp(`<${firstTagName}>[\\s\\S]*?<\\/${firstTagName}>`);
    const match = str.match(fullTagMatcher);
    if (!match) {
      if (openingTag.charAt(openingTag.length - 2) === '/') {
        // self-closing tag
        nodes.push(openingTag)
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

function htmlForMarkdownifiedLine(str, highlightDialogue = true) {
  const outerNodes = splitIntoNodes(str);
  const htmlAddedNodes = outerNodes.map(node => {
    const isParagraph = node.match(/^<p/);
    if (!isParagraph) { return wrapStageDirections(node); }

    let [_, open, character, dialogue, close] = node.match(/(<p>)([\w\s.&/;#']{1,38}:)?([\s\S]*?)(<\/p>)/)
    dialogue = wrapStageDirections(dialogue);
    character = character ? `<span class="character">${character}</span>` : '';
    if (highlightDialogue) {
      dialogue = `<span class="highlighted">${dialogue}</span>`;
    }
    return `${open}${character}${dialogue}${close}`;
  })
  return htmlAddedNodes.join('');
}

export function hashCode (s) {
  var hash = 0,
    i, l, character;
  if (s.length === 0) return hash;
  for (i = 0, l = s.length; i < l; i++) {
    character = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + character;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export function truncatedHash (s, numChars) {
  numChars = numChars === undefined ? 5 : numChars;
  return Math.abs(hashCode(s)).toString().substring(0, numChars);
}
