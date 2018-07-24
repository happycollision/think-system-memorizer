import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { ICardDecks, ICard, IActionType } from 'think-system-memorizer/reducers';
import { connect } from 'ember-redux';

const stateToComputed = (state: { cardDecks: ICardDecks}) => {
  return {
    cardDecks: state.cardDecks
  };
};

const dispatchToActions = (dispatch: any) => {
  return {
    flipCard: (card: ICard) => dispatch({type: IActionType.FlipCard, card})
  };
};

class CardDecksDataComponent extends Component {
  @computed('cardDecks', 'name') get singleDeck(this: CardDecksDataComponent): ICard[] {
    // @ts-ignore (cardDecks is set during connect)
    const decks: ICardDecks = this.get('cardDecks');
    // @ts-ignore (name is set by caller)
    const deckName: string = this.get('name');
    return decks[deckName].cards;
  }
}

export default connect(
  stateToComputed,
  dispatchToActions
)(CardDecksDataComponent);
