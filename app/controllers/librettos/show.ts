import Controller from '@ember/controller';
import { computed, action } from '@ember-decorators/object';

export default class LibrettosShowController extends Controller.extend({
  queryParams: ['card', 'view'],
}) {
  card = 1;
  view: 'cards' | 'script' = 'cards'

  @computed('card') get cardIndex(): number {
    return this.get('card') - 1;
  }
  set cardIndex(num: number) {
    this.set('card', num + 1)
  }

  @computed('view') get isCardView(): boolean {
    return this.get('view') !== 'script';
  }

  @computed('card') get nextCard(): number {
    return this.get('card') + 1;
  }

  @computed('card') get previousCard(): number {
    return this.get('card') - 1;
  }

  @action goToCardWithIndex(index: number, ev: Event) {
    ev.preventDefault();
    // @ts-ignore (improperly typed. first param is optional)
    this.transitionToRoute({queryParams: {card: index + 1, view: 'cards'}});
  }

  sequenceStep = 0;

  next() {
    console.log('next')
  }

  flip() {
    console.log('flip')
  }

  reset() {
    console.log('reset')
  }

  @action sequencialMemorize() {
    this.sequenceStep++;
    if (this.sequenceStep === 8) {
      this.reset()
      this.sequenceStep = 0;
      return;
    }
    switch (this.sequenceStep % 2 === 1) {
      case true:
        this.flip()
      break;
      case false:
        this.next()
      break;
    }
  }
}
