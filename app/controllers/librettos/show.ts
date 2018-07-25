import Controller from '@ember/controller';
import { computed } from '@ember-decorators/object';

export default class LibrettosShowController extends Controller.extend({
  queryParams: ['card'],
}) {
  card = 1;
  @computed('card') get cardIndex(): number {
    return this.get('card') - 1;
  }
  set cardIndex(num: number) {
    this.set('card', num + 1)
  }

  @computed('card') get nextCard(): number {
    return this.get('card') + 1;
  }

  @computed('card') get previousCard(): number {
    return this.get('card') - 1;
  }
}
