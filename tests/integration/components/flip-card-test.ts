import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | flip-card', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders the front of a card', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<FlipCard as |card|><card.front>Hello</card.front><card.back>There</card.back></FlipCard>`);

    assert.dom('[data-test-card-side]:first-child').hasText('Hello')
    assert.dom('[data-test-card-side]:last-child').hasText('There')
  });

  test('it renders the back of a card only when flipped', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('flipped', false);
    
    await render(hbs`<FlipCard @flipped={{flipped}} as |card|><card.back>Hello</card.back></FlipCard>`);
    assert.dom(this.element.firstChild).hasNoClass('flipped', 'Back starts hidden');

    this.set('flipped', true);
     
    assert.dom(this.element.firstChild).hasClass('flipped', 'Back becomes visible');
  })
});
