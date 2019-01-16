import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | card-deck', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('cards', [
      {front: 'hi', back: 'there', isFlipped: true}
    ])
    // Template block usage:
    await render(hbs`<CardDeck @cards={{cards}} @currentIndex={{0}} />`);

    assert.dom('[data-test-flip-card] [data-test-card-front]').matchesText('hi')
    assert.dom('[data-test-flip-card] [data-test-card-back]').matchesText('there')
  });
});
