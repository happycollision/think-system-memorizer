import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { create, createList } from 'think-system-memorizer/tests/factories';

module('Integration | Component | card-decks-data', function(hooks) {
  setupRenderingTest(hooks);

  test('it supplies the cards for a given deck', async function(assert) {
    const winningDeck = create('cardDeck', {
      name: 'Winner',
      cards: createList('card', 2, {front: 'winner', back: 'winner'})
    });
    const cardDecks = create('cardDecks', {decks: [winningDeck]})
    this.set('deckName', 'Winner');

    const redux = this.owner.lookup('service:redux');
    redux.getState = () => ({cardDecks});

    await render(hbs`
      <CardDecksData @name={{deckName}} as |decks|>
        {{#each decks.single as |card|}}
          {{card.front}} {{card.back}}
        {{/each}}
      </CardDecksData>
    `);

    assert.dom().hasTextContaining('winner');
  });
});
