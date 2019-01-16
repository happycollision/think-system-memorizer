import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { IActionType, IRegisteredAction } from 'think-system-memorizer/reducers';
import { connect } from 'ember-redux';
import { ICard, StoreState } from 'state';

const stateToComputed = (state: StoreState) => {
  return {
    cardDecks: state.cardDecks.decks
  };
};

const dispatchToActions = (dispatch: (x: IRegisteredAction) => void) => {
  return {
    flipCard: (id: number|string) => dispatch({type: IActionType.FlipCard, id})
  };
};

class CardDecksDataComponent extends Component.extend({
  tagName: '',
}) {
  // TODO add back a this context after babel bug is fixed
  @computed('cardDecks', 'name') get singleDeck(): ICard[] {
    // @ts-ignore (cardDecks is set during connect)
    const decks: StoreState['cardDecks']['decks'] = this.get('cardDecks');
    // @ts-ignore (name is set by caller)
    const deckName: string = this.get('name');
    return decks.find(deck => deck.name === deckName)!.cards;
  }
}

export default connect(
  stateToComputed,
  dispatchToActions
)(CardDecksDataComponent);
