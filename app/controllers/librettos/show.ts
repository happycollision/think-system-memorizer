import Controller from '@ember/controller';
import { computed } from '@ember-decorators/object';
import { makeParts } from '../../utils/textInterpreter';

function createEl(str: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = str;
  return el;
}

export default class LibrettosShowController extends Controller {
  @computed('model') get cards(): Array<{front: HTMLElement, back: HTMLElement, isFlipped: boolean}> {
    return makeParts(this.get('model').text).map(tuple => {
      const [front, back] = tuple.map(str => createEl(str));
      return {front, back, isFlipped: false};
    })
  }
}
