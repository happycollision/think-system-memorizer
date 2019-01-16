import { combineReducers } from 'redux';
import { makeParts } from '../utils/textInterpreter';
import { createElWithInnerHTML } from '../utils/createElement';
import { clone } from 'happy-helpers';
import { CardDecksState } from 'state';

export enum IActionType {
  RegisterText = 'REGISTER_LIBRETTO_TEXT',
  FlipCard = 'FLIP_CARD',
  SetCardIndex = 'SET_CARD_INDEX',
  UnflipAllInDeck = 'UNFLIP_ALL_IN_DECK',
}

export type IRegisteredAction =
  IRegisteredAction.FlipCard
  | IRegisteredAction.RegisterTest
  | IRegisteredAction.SetCardIndex
  | IRegisteredAction.UnflipAllInDeck

export declare namespace IRegisteredAction {
  interface BaseAction {
    type: IActionType;
  }
  
  interface SetCardIndex extends BaseAction {
    type: IActionType.SetCardIndex;
    name: string;
    newIndex: number;
  }
  
  interface UnflipAllInDeck extends BaseAction {
    type: IActionType.UnflipAllInDeck;
    name: string;
  }
  
  interface RegisterTest extends BaseAction {
    type: IActionType.RegisterText;
    name: string;
    text: string;
  }

  interface FlipCard extends BaseAction {
    type: IActionType.FlipCard;
    id: number | string;
  }
}

let id = 0;
function createId() {
  return ++id;
}

function cardDecks(state: CardDecksState = {decks: []}, action: IRegisteredAction): CardDecksState {
  if (action.type === IActionType.RegisterText) {
    const cards = makeParts(action.text).map(tuple => {
      const [front, back] = tuple.map(htmlString => createElWithInnerHTML(htmlString))
      return {front, back, isFlipped: false, id: createId()};
    });
    const newCardDeck = {name: action.name, cards, currentIndex: 0};
    const newState = clone(state)
    newState.decks.push(newCardDeck);
    return newState;
  }

  if (action.type === IActionType.FlipCard) {
    const newState = clone(state);
    newState.decks =  newState.decks.map((deck) => {
      const newDeck = {...deck, cards: deck.cards.map(card => {
        if (card.id === action.id) {
          return {...card, isFlipped: !card.isFlipped};
        }
        return card;
      })};
      return newDeck
    })
    return newState;
  }

  if (action.type === IActionType.SetCardIndex) {
    const newState = clone(state);
    newState.decks.forEach(deck => {
      if (action.name === deck.name) {
        deck.currentIndex = action.newIndex;
      }
    })
    return newState;
  }

  if (action.type === IActionType.UnflipAllInDeck) {
    const newState = clone(state);
    newState.decks.forEach(deck => {
      if (action.name === deck.name) {
        deck.cards.forEach(card => card.isFlipped = false)
      }
    });
    return newState;
  }

  return state || {};
};

export default combineReducers({
  cardDecks,
});