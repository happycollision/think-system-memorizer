import { test, module } from 'qunit';
import { setupTest } from 'ember-qunit';
import { deepFreeze } from 'ember-redux-freeze';
import reducer, { ICardDecks, IActionType } from 'think-system-memorizer/reducers';
import { createList, create } from 'think-system-memorizer/tests/factories';

module('Unit | Reducers | card-decks', function(hooks) {
  setupTest(hooks);

  test('set a new current index', function(assert) {
    const cardDecks: ICardDecks = {
      'anyDeck': create('cardDeck', {name: 'anyDeck', currentIndex: 0})
    };

    deepFreeze(cardDecks);

    const result = reducer({cardDecks}, {type: IActionType.SetCardIndex, name: 'anyDeck', newIndex: 1});

    assert.deepEqual(result, {
      cardDecks: {
        'anyDeck': {...cardDecks['anyDeck'], currentIndex: 1}
      }
    });
  });

  test('flip a card, and flip it back', function(assert) {
    const cardList = createList('card', 3, {isFlipped: false});
    const firstId = cardList[0].id;
    const [, ...tail] = cardList;
    const cardDecks: ICardDecks = {
      'anyDeck': create('cardDeck', {name: 'anyDeck', cards: cardList})
    };

    deepFreeze(cardDecks);

    const result = reducer({cardDecks}, {type: IActionType.FlipCard, id: firstId});

    assert.deepEqual(result, {
      cardDecks: {
        'anyDeck': create('cardDeck', {
          name: 'anyDeck',
          cards: [{...cardList[0], isFlipped: true}, ...tail]
        })
      }
    });

    const nextResult = reducer(result, {type: IActionType.FlipCard, id: firstId});

    assert.deepEqual(nextResult, {
      cardDecks: {
        'anyDeck': create('cardDeck', {
          name: 'anyDeck',
          cards: [{...cardList[0], isFlipped: false}, ...tail]
        })
      }
    });
  });
});