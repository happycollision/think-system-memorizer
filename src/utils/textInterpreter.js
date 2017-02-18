import {markdown} from 'markdown';

export function makeParts (text) {
  const regex = /^(?:(?!HH:)[\s\S])+HH:.*$/gm;
  let m;
  let a = [];
  let split;
  function addSplitsToArray (match) {
    split = match.split('HH:');
    a.push([
      markdown.toHTML(split[0]), 
      markdown.toHTML(split[1])
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

