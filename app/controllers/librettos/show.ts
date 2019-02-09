import Controller from '@ember/controller';
import { computed, action } from '@ember-decorators/object';
import { inject as service } from '@ember-decorators/service';
import { IActionType, IRegisteredAction } from 'think-system-memorizer/reducers';
import { observer } from '@ember/object';
import { StoreState, ICard } from 'state';

function getLSCardByScript(name: string) {
  return parseInt(window.localStorage.getItem(`${name}-card`) || '0', 10)
}

function setLSCardByScript(name: string, card: number) {
  window.localStorage.setItem(`${name}-card`, card.toString());
}

export default class LibrettosShowController extends Controller.extend({
  queryParams: ['card', 'view'],
  
  updateCard: observer('card', 'model', function(this: LibrettosShowController) {
    const newIndex = this.get('card') - 1;
    // @ts-ignore (path property get)
    const name = this.get('model.name');
    if (!name) return;
    const action: IRegisteredAction.SetCardIndex = {type: IActionType.SetCardIndex, name, newIndex}
    this.get('redux').dispatch(action)
  })
}) {

  @computed('model')
  get card() {
    // @ts-ignore (path property get)
    const name = this.get('model.name');
    if (!name) { return 1 }
    
    const localCard = getLSCardByScript(name);
    if (localCard > 0) {
      return localCard;
    } else {
      setLSCardByScript(name, 1);
      return 1;
    }
  }
  set card(n: number) {
    // @ts-ignore (path property get)
    const name = this.get('model.name');
    if (!name) {return}
    setLSCardByScript(name, n)
  }
  
  view: 'cards' | 'script' = 'cards'

  @service('redux') redux!: ReduxService;

  @computed('card', 'model') get cardIndex(): number {
    // @ts-ignore (path property get)
    const name = this.get('model.name');
    if (!name) return this.get('card') - 1;
    return (this.get('redux').getState() as StoreState).cardDecks.decks.find(d => d.name === name)!.currentIndex;
  }
  set cardIndex(num: number) {
    this.set('card', num + 1)
  }

  @computed('cardIndex', 'model.name') get currentCard(): ICard {
    // @ts-ignore (path property get)
    const name = this.get('model.name')
    const currentIndex = this.get('cardIndex');
    return (this.redux.getState() as StoreState).cardDecks.decks.find(d => d.name === name)!.cards[currentIndex];
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

  @action goToCardWithIndex(index: number, ev?: Event) {
    if (ev) ev.preventDefault();
    // @ts-ignore (improperly typed. first param is optional)
    this.transitionToRoute({queryParams: {card: index + 1, view: 'cards'}});
  }

  sequenceStep = 0;

  next() {
    const currentIndex = this.get('cardIndex');
    this.goToCardWithIndex(currentIndex + 1)
  }

  prev() {
    const currentIndex = this.get('cardIndex');
    this.goToCardWithIndex(currentIndex - 1)
  }

  flip() {
    const id = this.get('currentCard').id;
    const action: IRegisteredAction.FlipCard = {type: IActionType.FlipCard, id}
    this.redux.dispatch(action)
  }

  reset() {
    const redux = this.get('redux');
    // @ts-ignore (path property get)
    const name = this.get('model.name');
    const action: IRegisteredAction.UnflipAllInDeck = {type: IActionType.UnflipAllInDeck, name};
    redux.dispatch(action);
    const currentIndex = this.get('cardIndex');
    this.goToCardWithIndex(currentIndex - 2);
  }

  @action prevBtn() {
    this.prev()
  }
  @action nextBtn() { 
    this.next()
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
