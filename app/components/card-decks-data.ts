import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { ICardDecks, ICardDeck } from 'think-system-memorizer/reducers';
import { connect } from 'ember-redux';

const stateToComputed = (state: { cardDecks: ICardDecks}) => {
  return {
    cardDecks: state.cardDecks
  };
};

const dispatchToActions = (dispatch) => {
  return {
    // add: () => dispatch({type: 'ADD'})
  };
};

class CardDecksDataComponent extends Component {
  @computed('cardDecks', 'name') get singleDeck(): ICardDeck {
    const decks: ICardDecks = this.get('cardDecks');
    return decks[this.get('name')].cards;
  }
}

export default connect(
  stateToComputed,
  dispatchToActions
)(CardDecksDataComponent);
