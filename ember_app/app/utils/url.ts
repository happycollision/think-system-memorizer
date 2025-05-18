import { last, first } from 'lodash-es'

/**
 * Joins paths together. If any part begins with '//', previous parts are *removed*
 * so that the resulting url is domain-level. Joining an ending '/' to a starting,
 * single '/' will collapse them down to one slash.
 * 
 * @param parts list of parts of a path
 */
export function join(...parts: string[]) {
  return parts.reduce((acc, current) => {
    if (current.slice(0,1) === '//') return current;
    if (last(acc) === '/' && first(current) === '/') {
      return acc + current.slice(1);
    }
    return acc + current;
  }, '');
}