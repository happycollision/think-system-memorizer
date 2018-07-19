import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | librettos', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:librettos');
    assert.ok(route);
  });
});
