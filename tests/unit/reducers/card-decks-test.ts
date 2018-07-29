import { test, module } from 'qunit';
import { setupTest } from 'ember-qunit';
import { deepFreeze } from 'ember-redux-freeze';
import reducer, { ICardDecks, IActionType } from 'think-system-memorizer/reducers';
import { createList } from 'think-system-memorizer/tests/factories';

module('Unit | Reducers | card-decks', function(hooks) {
  setupTest(hooks);

  test('flip a card, and flip it back', function(assert) {
    const cardList = createList('card', 3, {isFlipped: false});
    const firstId = cardList[0].id;
    const [, ...tail] = cardList;
    const cardDecks: ICardDecks = {
      'anyDeck': {
        cards: cardList,
        name: 'anyDeck',
      }
    };

    deepFreeze(cardDecks);

    const result = reducer({cardDecks}, {type: IActionType.FlipCard, id: firstId});

    assert.deepEqual(result, {
      cardDecks: {
        'anyDeck': {
          cards: [{...cardDecks['anyDeck'].cards[0], isFlipped: true}, ...tail],
          name: 'anyDeck',
        }
      }
    });

    const nextResult = reducer(result, {type: IActionType.FlipCard, id: firstId});

    assert.deepEqual(nextResult, {
      cardDecks: {
        'anyDeck': {
          cards: [{...cardDecks['anyDeck'].cards[0], isFlipped: false}, ...tail],
          name: 'anyDeck',
        }
      }
    });
  });
});