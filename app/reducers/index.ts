import { combineReducers } from 'redux';
import { makeParts } from '../utils/textInterpreter';
import { createElWithInnerHTML } from '../utils/createElement';

export enum IActionType {
  RegisterText = 'REGISTER_LIBRETTO_TEXT',
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

function cardDecks(state: ICardDecks, action: IRegisteredAction): ICardDecks {
  if (action.type === IActionType.RegisterText) {
    action as IRegisteredAction.RegisterTest;
    const cards = makeParts(action.text).map(tuple => {
      const [front, back] = tuple.map(htmlString => createElWithInnerHTML(htmlString))
      return {front, back, isFlipped: false};
    });
    const newCardDeck: ICardDeck = {name: action.name, cards};
    const newState = Object.assign({}, state);
    newState[action.name] = newCardDeck;
    return newState;
  }
  return state || {};
};

export default combineReducers({
  cardDecks,
});