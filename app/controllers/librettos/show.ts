import Controller from '@ember/controller';
import { computed } from '@ember-decorators/object';
import { makeParts } from '../../utils/textInterpreter';

export default class LibrettosShowController extends Controller {
  @computed('model') get cards(): Array<{front: string, back: string, isFlipped: boolean}> {
    return makeParts(this.get('model').text).map(tuple => {
      const [front, back] = tuple;
      return {front, back, isFlipped: false};
    })
  }
}
