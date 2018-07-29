import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | card interactions', function(hooks) {
  setupApplicationTest(hooks);

  test('clicking can flip a card', async function(assert) {
    await visit('/librettos/elf-jovie?view=cards');

    assert.dom('.flipped [data-test-card-front]').doesNotExist()
    await click('[data-test-card-front]')
    assert.dom('.flipped [data-test-card-front]').exists()
  });

  test('the next and previous buttons move the cards along', async function(assert) {
    await visit('/librettos/elf-jovie?view=cards');

    await click('[data-test-next-card]')
    assert.ok(currentURL().match('card=2'))

    await click('[data-test-previous-card]')
    assert.notOk(currentURL().match('card=2'))
  });

  test('re-memorize sequencially steps through cards', async function(assert) {
    await visit('/librettos/elf-jovie?view=cards');
    const redux = this.owner.lookup('service:redux');
    const currentState = () => redux.getState();

    await click('[data-test-sequencial-memorize]');
    assert.equal(currentState().cardDecks['Elf: Jovie'].cards[0].isFlipped, true, 'the first card gets flipped');

    await click('[data-test-sequencial-memorize]');
    assert.ok(currentURL().match('card=2'), 'The second card is showing');
    await click('[data-test-sequencial-memorize]');
    assert.equal(currentState().cardDecks['Elf: Jovie'].cards[1].isFlipped, true, 'the second card gets flipped');

    await click('[data-test-sequencial-memorize]');
    assert.ok(currentURL().match('card=3'), 'The third card is showing');
    await click('[data-test-sequencial-memorize]');
    assert.equal(currentState().cardDecks['Elf: Jovie'].cards[2].isFlipped, true, 'the third card gets flipped');

    await click('[data-test-sequencial-memorize]');
    assert.ok(currentURL().match('card=4'), 'The fourth card is showing');
    await click('[data-test-sequencial-memorize]');
    assert.equal(currentState().cardDecks['Elf: Jovie'].cards[3].isFlipped, true, 'the fourth card gets flipped');

    await click('[data-test-sequencial-memorize]');
    assert.ok(currentURL().match('card=2'), 'The second card is showing again');
    assert.equal(currentState().cardDecks['Elf: Jovie'].cards[1].isFlipped, false, 'the second card is no longer flipped');
    await click('[data-test-sequencial-memorize]');
    assert.equal(currentState().cardDecks['Elf: Jovie'].cards[1].isFlipped, true, 'the second card is flipped again');

    await click('[data-test-sequencial-memorize]');
    assert.ok(currentURL().match('card=3'), 'The third card is showing again');
    assert.equal(currentState().cardDecks['Elf: Jovie'].cards[2].isFlipped, false, 'the third card is no longer flipped');
    await click('[data-test-sequencial-memorize]');
    assert.equal(currentState().cardDecks['Elf: Jovie'].cards[2].isFlipped, true, 'the third card is flipped again');

    await click('[data-test-sequencial-memorize]');
    assert.ok(currentURL().match('card=4'), 'The fourth card is showing again');
    assert.equal(currentState().cardDecks['Elf: Jovie'].cards[3].isFlipped, false, 'the fourth card is no longer flipped');
    await click('[data-test-sequencial-memorize]');
    assert.equal(currentState().cardDecks['Elf: Jovie'].cards[3].isFlipped, true, 'the fourth card is flipped again');

    await click('[data-test-sequencial-memorize]');
    assert.ok(currentURL().match('card=5'), 'The fifth card is showing');
    await click('[data-test-sequencial-memorize]');
    assert.equal(currentState().cardDecks['Elf: Jovie'].cards[4].isFlipped, true, 'the fifth card gets flipped');

    await click('[data-test-sequencial-memorize]');
    assert.ok(currentURL().match('card=3'), 'The third card is showing again');
    assert.equal(currentState().cardDecks['Elf: Jovie'].cards[2].isFlipped, false, 'the third card is no longer flipped');
    await click('[data-test-sequencial-memorize]');
    assert.equal(currentState().cardDecks['Elf: Jovie'].cards[2].isFlipped, true, 'the third card is flipped again');
  })
});
