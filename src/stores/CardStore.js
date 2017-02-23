import { EventEmitter } from 'events';
import { clone, isEmpty } from '../utils/helper-functions';
import dispatcher from '../utils/dispatcher';
import {makeParts} from '../utils/textInterpreter';
import Persistence from '../utils/Persistence';

const persistence = new Persistence('CardStore');

class CardStore extends EventEmitter {
  constructor () {
    super();
    let cardPosition = persistence.getItem('cardPosition') || 0;
    this.state = {cardPosition};
  }

  incrementCard() {
    this.state.cardPosition++;
    this.emit('POSITION_CHANGE');
    persistence.setItem('cardPosition', this.state.cardPosition)
  }

  decrementCard() {
    this.state.cardPosition--;
    this.emit('POSITION_CHANGE');
    persistence.setItem('cardPosition', this.state.cardPosition)
  }

  reportCardPosition(position) {
    this.state.cardPosition = position;
    this.emit('POSITION_CHANGE_REPORTED');
    persistence.setItem('cardPosition', this.state.cardPosition)
  }

  getCards() {
    return this.cards ? clone(this.cards) : [];
  }

  getCardPosition() {
    return this.state.cardPosition;
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
      case 'REPORT_CARD_POSITION':
        this.reportCardPosition(action.cardPosition);
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
