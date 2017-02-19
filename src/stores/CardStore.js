import { EventEmitter } from 'events';
import { clone } from '../utils/helper-functions';
import dispatcher from '../utils/dispatcher';

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

  getAllCards() {
    return this.cards ? clone(this.cards) : {};
  }

  getCardPosition() {
    return this.cardPosition;
  }

  handleActions(action) {
    switch(action.type) {
      case 'INCREMENT_CARD':
        this.incrementCard();
      break;
      case 'DECREMENT_CARD':
        this.decrementCard();
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
