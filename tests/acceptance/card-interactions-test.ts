import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | card interactions', function(hooks) {
  setupApplicationTest(hooks);

  test('it can flip a card', async function(assert) {
    await visit('/librettos/elf-jovie?view=cards');

    assert.dom('.flipped [data-test-card-front]').doesNotExist()
    await click('[data-test-card-front]')
    assert.dom('.flipped [data-test-card-front]').exists()
  });
});
