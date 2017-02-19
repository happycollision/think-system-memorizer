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
