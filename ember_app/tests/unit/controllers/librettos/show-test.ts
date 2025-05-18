import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | librettos/show', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:librettos/show');
    assert.ok(controller);
  });
});
