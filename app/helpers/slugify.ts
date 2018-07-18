import { helper } from '@ember/component/helper';

export function slugify(params: [string]) {
  return params[0].toLowerCase().replace(/\s/g, '-').replace(/[^\da-z-]/g, '');
}

export default helper(slugify);
