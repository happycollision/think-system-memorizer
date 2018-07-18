import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | slugify', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('inputValue', 'hi there 2: people');

    await render(hbs`{{slugify inputValue}}`);

    assert.equal(this.element.textContent.trim(), 'hi-there-2-people');
  });
});
