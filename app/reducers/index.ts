import { combineReducers } from 'redux';
import { makeParts } from '../utils/textInterpreter';
import { createElWithInnerHTML } from '../utils/createElement';
import { traverseObject } from 'happy-helpers';

export enum IActionType {
  RegisterText = 'REGISTER_LIBRETTO_TEXT',
  FlipCard = 'FLIP_CARD',
}

export interface IRegisteredAction extends IAction {
  type: IActionType;
}

export declare namespace IRegisteredAction {
  interface RegisterTest extends IRegisteredAction {
    type: IActionType.RegisterText;
    name: string;
    text: string;
  }
}

export interface ICard {
  id: string | number;
  front: HTMLElement;
  back: HTMLElement;
  isFlipped: boolean;
}

export interface ICardDeck {
  name: string;
  cards: Array<ICard>
}

export interface ICardDecks {
  [x: string]: ICardDeck
}

let id = 0;
function createId() {
  return ++id;
}

function cardDecks(state: ICardDecks, action: IRegisteredAction): ICardDecks {
  if (action.type === IActionType.RegisterText) {
    action as IRegisteredAction.RegisterTest;
    const cards = makeParts(action.text).map(tuple => {
      const [front, back] = tuple.map(htmlString => createElWithInnerHTML(htmlString))
      return {front, back, isFlipped: false, id: createId()};
    });
    const newCardDeck: ICardDeck = {name: action.name, cards};
    const newState = Object.assign({}, state);
    newState[action.name] = newCardDeck;
    return newState;
  }

  if (action.type === IActionType.FlipCard) {
    const newState = traverseObject(state, (key, value: ICardDeck) => {
      const newValue: ICardDeck = {...value, cards: value.cards.map(card => {
        if (card === action.card) {
          return {...card, isFlipped: !card.isFlipped};
        }
        return card;
      })};
      return [key, newValue]
    }, false, false);
    return newState;
  }

  return state || {};
};

export default combineReducers({
  cardDecks,
});