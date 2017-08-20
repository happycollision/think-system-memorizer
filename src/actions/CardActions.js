import dispatcher from '../utils/dispatcher';

export function incrementCard () {
  dispatcher.dispatch({type: 'INCREMENT_CARD'})
}

export function decrementCard () {
  dispatcher.dispatch({type: 'DECREMENT_CARD'})
}

export function makeDeck (librettoText) {
  dispatcher.dispatch({type: 'MAKE_DECK', librettoText})
}

export function reportCardPosition (cardPosition) {
  dispatcher.dispatch({type: 'REPORT_CARD_POSITION', cardPosition})
}

export function setCardPosition (cardPosition) {
  dispatcher.dispatch({type: 'SET_CARD_POSITION', cardPosition})
}

export function resetFlippedStateForAllCards () {
  dispatcher.dispatch({type: 'RESET_CARDS_FLIP_STATE'})
}

export function flipCardToBackByIndex (cardIndex) {
  dispatcher.dispatch({type: 'FLIP_CARD_TO_BACK', cardIndex})
}
