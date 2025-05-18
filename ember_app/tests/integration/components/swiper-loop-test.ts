import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | swiper-loop', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('things', ['thing1', 'thing2']);

    // Template block usage:
    await render(hbs`
      <SwiperLoop @items={{things}} @currentIndex={{0}} as |item|>
        {{ item }}
      </SwiperLoop>
    `);

    assert.dom('[data-test-swiper-loop]').matchesText(/thing1 ?\s* ?thing2/);
  });
});
