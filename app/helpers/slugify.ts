import { helper } from '@ember/component/helper';
import { dasherize as stringDasherize } from '@ember/string';

export function slugify(params: [string]) {
  return stringDasherize(params[0]).replace(/[^A-z-]/g, '');
}

export default helper(slugify);
