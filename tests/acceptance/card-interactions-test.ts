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
});
