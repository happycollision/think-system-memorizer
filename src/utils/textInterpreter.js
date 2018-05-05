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
  const regex = /[\S\s]*?^\s?>[A-z. ]{1,20}:[\s\S]*?(?:(?!^(?:[A-z. ]{1,20}:|#))[\S\s])+/gm // switched to this for bridges
  let m;
  let a = [];
  let split;
  function addSplitsToArray (match) {
    split = match.split(/^>/m);
    a.push([
      markdownify(split[0]),
      markdownify(split[1])
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

export function highlightText (text) {
  return makeParts(text).reduce((a,exchange) => {
    a += turnExchangeIntoHighlightedHTML(exchange);
    return a;
  }, '');
}

export function turnExchangeIntoHighlightedHTML(exchange) {
  return exchange.reduce((a, side, i) => {
    if (side.match('At least,')) { debugger; }
    if (i === 1) {
      let matches = side.match(/(<p>.*?:)(.*?)(<\/p>)/)
      let line = matches[2];
      line = line.replace(/\(.*?\)/g, (substr) => `<span class="stage-directions">${substr}</span>`)
      a += `${matches[1]}<span class="highlighted">${line}</span>${matches[3]}`;
    } else {
      a += side.replace(/\(.*?\)/g, (substr) => `<span class="stage-directions">${substr}</span>`);
    }
    return a;
  }, '')
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
