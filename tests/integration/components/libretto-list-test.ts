import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | libretto-list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders links to librettos', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('librettos', [
      {label: 'Some Show', file: '/files/some-show.txt'},
      {label: 'Some Show 2: Electric Boogaloo', file: '/files/some-show2.txt'},
      {label: 'Anything Goes', file: '/files/boat.txt'},
    ])

    this.owner.lookup('router:main').setupRouter();

    await render(hbs`<LibrettoList @librettos={{librettos}} />`);

    assert.dom('a[href$="some-show"]').containsText('Some Show');
    assert.dom('a[href$="some-show-2-electric-boogaloo"]').containsText('Some Show 2: Electric Boogaloo');
    assert.dom('a[href$="anything-goes"]').containsText('Anything Goes');
  });
});
