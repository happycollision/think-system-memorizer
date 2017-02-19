import { EventEmitter } from 'events';
import { clone, isEmpty } from '../utils/helper-functions';
import dispatcher from '../utils/dispatcher';
import {makeParts} from '../utils/textInterpreter';

class CardStore extends EventEmitter {
  constructor () {
    super();
    this.cardPosition = 0;
  }

  incrementCard() {
    this.cardPosition++;
    this.emit('POSITION_CHANGE')
  }

  decrementCard() {
    this.cardPosition--;
    this.emit('POSITION_CHANGE')
  }

  getCards() {
    return this.cards ? clone(this.cards) : [];
  }

  getCardPosition() {
    return this.cardPosition;
  }

  makeDeck(librettoText) {
    if (isEmpty(librettoText)) return;
    this.cards = makeParts(librettoText);
    this.emit('NEW_DECK');
  }

  handleActions(action) {
    switch(action.type) {
      case 'INCREMENT_CARD':
        this.incrementCard();
      break;
      case 'DECREMENT_CARD':
        this.decrementCard();
      break;
      case 'MAKE_DECK':
        this.makeDeck(action.librettoText);
      break;
      default:
        // nothing
      break;
    }
  }
}

const cardStore = new CardStore();
dispatcher.register(cardStore.handleActions.bind(cardStore))

window.cardStore = cardStore;
export default cardStore;
