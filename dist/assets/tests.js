'use strict';

define("think-system-memorizer/tests/acceptance/card-interactions-test", ["qunit", "@ember/test-helpers", "ember-qunit"], function (_qunit, _testHelpers, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Acceptance | card interactions', function (hooks) {
    (0, _emberQunit.setupApplicationTest)(hooks);
    (0, _qunit.test)('clicking can flip a card', async function (assert) {
      await (0, _testHelpers.visit)('/librettos/elf-jovie?view=cards');
      assert.dom('.flipped [data-test-card-front]').doesNotExist();
      await (0, _testHelpers.click)('[data-test-card-front]');
      assert.dom('.flipped [data-test-card-front]').exists();
    });
    (0, _qunit.test)('the next and previous buttons move the cards along', async function (assert) {
      await (0, _testHelpers.visit)('/librettos/elf-jovie?view=cards');
      await (0, _testHelpers.click)('[data-test-next-card]');
      assert.ok((0, _testHelpers.currentURL)().match('card=2'));
      await (0, _testHelpers.click)('[data-test-previous-card]');
      assert.notOk((0, _testHelpers.currentURL)().match('card=2'));
    });
    (0, _qunit.test)('data store card index matches url', async function (assert) {
      await (0, _testHelpers.visit)('/librettos/elf-jovie?view=cards&card=3');
      const redux = this.owner.lookup('service:redux');

      const currentState = () => redux.getState();

      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').currentIndex, 2, 'First card showing is card 3 (index 2)');
      await (0, _testHelpers.click)('[data-test-next-card]');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').currentIndex, 3, 'Card showing is card 4 (index 3)');
    });
    (0, _qunit.test)('re-memorize sequencially steps through cards', async function (assert) {
      await (0, _testHelpers.visit)('/librettos/elf-jovie?view=cards');
      const redux = this.owner.lookup('service:redux');

      const currentState = () => redux.getState();

      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').cards[0].isFlipped, true, 'the first card gets flipped');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.ok((0, _testHelpers.currentURL)().match('card=2'), 'The second card is showing');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').cards[1].isFlipped, true, 'the second card gets flipped');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.ok((0, _testHelpers.currentURL)().match('card=3'), 'The third card is showing');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').cards[2].isFlipped, true, 'the third card gets flipped');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.ok((0, _testHelpers.currentURL)().match('card=4'), 'The fourth card is showing');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').cards[3].isFlipped, true, 'the fourth card gets flipped');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.ok((0, _testHelpers.currentURL)().match('card=2'), 'The second card is showing again');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').cards[1].isFlipped, false, 'the second card is no longer flipped');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').cards[1].isFlipped, true, 'the second card is flipped again');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.ok((0, _testHelpers.currentURL)().match('card=3'), 'The third card is showing again');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').cards[2].isFlipped, false, 'the third card is no longer flipped');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').cards[2].isFlipped, true, 'the third card is flipped again');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.ok((0, _testHelpers.currentURL)().match('card=4'), 'The fourth card is showing again');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').cards[3].isFlipped, false, 'the fourth card is no longer flipped');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').cards[3].isFlipped, true, 'the fourth card is flipped again');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.ok((0, _testHelpers.currentURL)().match('card=5'), 'The fifth card is showing');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').cards[4].isFlipped, true, 'the fifth card gets flipped');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.ok((0, _testHelpers.currentURL)().match('card=3'), 'The third card is showing again');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').cards[2].isFlipped, false, 'the third card is no longer flipped');
      await (0, _testHelpers.click)('[data-test-sequencial-memorize]');
      assert.equal(currentState().cardDecks.decks.find(d => d.name === 'Elf: Jovie').cards[2].isFlipped, true, 'the third card is flipped again');
    });
  });
});
define("think-system-memorizer/tests/factories/index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.create = create;
  _exports.createList = createList;
  _exports.default = void 0;

  class Definitions {
    constructor() {
      this.card = () => ({
        id: getNewId(),
        front: `front content for id ${lastId()}`,
        back: `back content for id ${lastId()}`,
        isFlipped: false
      });

      this.cardDeck = () => ({
        name: `Deck #${getNewId()}`,
        cards: createList('card', 2),
        currentIndex: 0
      });

      this.cardDecks = () => {
        const decks = createList('cardDeck', 2);
        return {
          decks
        };
      };
    }

  }

  const definitions = new Definitions();
  let incrementor = 1;

  function getNewId() {
    return incrementor++;
  }

  function lastId() {
    return incrementor;
  }

  function getFactory(faketory) {
    if (definitions[faketory] === undefined) {
      throw new Error(`Test factory \`create('${faketory}')\` failed. There is no factory called "${faketory}"`);
    }

    return definitions[faketory]();
  }

  function create(faketory, overrides) {
    let obj = getFactory(faketory);
    overrides = overrides || {};
    return Object.assign(obj, overrides);
  }

  function createList(factory, amount, overrides) {
    return Array.from(new Array(amount)).map(() => create(factory, overrides));
  }

  var _default = create;
  _exports.default = _default;
});
define("think-system-memorizer/tests/helpers/ember-cli-clipboard", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.triggerSuccess = triggerSuccess;
  _exports.triggerError = triggerError;
  _exports.default = _default;

  /* === Integration Test Helpers === */

  /**
   * Fires `success` action for an instance of a copy-button component
   * @function triggerSuccess
   * @param {Object} context - integration test’s this context
   * @param {String|Element} selector - selector of the copy-button instance
   * @returns {Void}
   */
  function triggerSuccess(context, selector) {
    fireComponentAction(context, selector, 'success');
  }
  /**
   * Fires `error` action for an instance of a copy-button component
   * @function triggerError
   * @param {Object} context - integration test’s this context
   * @param {String|Element} selector - selector of the copy-button instance
   * @returns {Void}
   */


  function triggerError(context, selector) {
    fireComponentAction(context, selector, 'error');
  }
  /* === Acceptance Test Helpers === */

  /**
   * Default export is a function that registers acceptance test helpers
   */


  function _default() {
    Ember.Test.registerAsyncHelper('triggerCopySuccess', function (app, selector = '.copy-btn') {
      fireComponentActionFromApp(app, selector, 'success');
    });
    Ember.Test.registerAsyncHelper('triggerCopyError', function (app, selector = '.copy-btn') {
      fireComponentActionFromApp(app, selector, 'error');
    });
  }
  /* === Private Functions === */

  /**
   * Fires named action for an instance of a copy-button component in an app
   * @function fireComponentActionFromApp
   * @param {Object} app - Ember application
   * @param {String|Element} selector - selector of the copy-button instance
   * @param {String} actionName - name of action
   * @returns {Void}
   */


  function fireComponentActionFromApp(app, selector, actionName) {
    fireComponentAction({
      container: app.__container__,
      $: app.$
    }, selector, actionName);
  }
  /**
   * Fires named action for an instance of a copy-button component
   * @function fireComponentAction
   * @param {Object} context - test context
   * @param {String|Element} selector - selector of the copy-button instance
   * @param {String} actionName - name of action
   * @returns {Void}
   */


  function fireComponentAction(context, selector, actionName) {
    let component = getComponentBySelector(context, selector);
    fireActionByName(component, actionName);
  }
  /**
   * Fetches component reference for a given context and selector
   * @function getComponentBySelector
   * @param {Object} context - test context
   * @param {String|Element} selector - selector of the copy-button instance
   * @returns {Object} component object
   */


  function getComponentBySelector(context, selector = '.copy-btn') {
    let emberId = context.$(selector).attr('id');
    return context.container.lookup('-view-registry:main')[emberId];
  }
  /**
   * Fires a component's action given an action name
   * @function fireActionByName
   * @param {Ember.Component} component - component to fire action from
   * @param {String} actionName - name of action
   * @returns {Void}
   */


  function fireActionByName(component, actionName) {
    let action = component[actionName];
    Ember.run(() => {
      if (typeof action === 'string') {
        component.sendAction(action);
      } else {
        action();
      }
    });
  }
});
define("think-system-memorizer/tests/integration/components/card-deck-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | card-deck', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      this.set('cards', [{
        front: 'hi',
        back: 'there',
        isFlipped: true
      }]); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "ew4GVqCS",
        "block": "{\"symbols\":[],\"statements\":[[5,\"card-deck\",[],[[\"@cards\",\"@currentIndex\"],[[21,\"cards\"],0]]]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.dom('[data-test-flip-card] [data-test-card-front]').matchesText('hi');
      assert.dom('[data-test-flip-card] [data-test-card-back]').matchesText('there');
    });
  });
});
define("think-system-memorizer/tests/integration/components/card-decks-data-test", ["qunit", "ember-qunit", "@ember/test-helpers", "think-system-memorizer/tests/factories"], function (_qunit, _emberQunit, _testHelpers, _factories) {
  "use strict";

  (0, _qunit.module)('Integration | Component | card-decks-data', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it supplies the cards for a given deck', async function (assert) {
      const winningDeck = (0, _factories.create)('cardDeck', {
        name: 'Winner',
        cards: (0, _factories.createList)('card', 2, {
          front: 'winner',
          back: 'winner'
        })
      });
      const cardDecks = (0, _factories.create)('cardDecks', {
        decks: [winningDeck]
      });
      this.set('deckName', 'Winner');
      const redux = this.owner.lookup('service:redux');

      redux.getState = () => ({
        cardDecks
      });

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "sJUBNXkw",
        "block": "{\"symbols\":[\"decks\",\"card\"],\"statements\":[[0,\"\\n      \"],[5,\"card-decks-data\",[],[[\"@name\"],[[21,\"deckName\"]]],{\"statements\":[[0,\"\\n\"],[4,\"each\",[[22,1,[\"single\"]]],null,{\"statements\":[[0,\"          \"],[1,[22,2,[\"front\"]],false],[0,\" \"],[1,[22,2,[\"back\"]],false],[0,\"\\n\"]],\"parameters\":[2]},null],[0,\"      \"]],\"parameters\":[1]}],[0,\"\\n    \"]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.dom().hasTextContaining('winner');
    });
  });
});
define("think-system-memorizer/tests/integration/components/flip-card-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | flip-card', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders the front of a card', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "Oo759doE",
        "block": "{\"symbols\":[\"card\"],\"statements\":[[5,\"flip-card\",[],[[],[]],{\"statements\":[[6,[22,1,[\"front\"]],[],[[],[]],{\"statements\":[[0,\"Hello\"]],\"parameters\":[]}],[6,[22,1,[\"back\"]],[],[[],[]],{\"statements\":[[0,\"There\"]],\"parameters\":[]}]],\"parameters\":[1]}]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.dom('[data-test-card-front]').hasText('Hello');
      assert.dom('[data-test-card-back]').hasText('There');
    });
    (0, _qunit.test)('it adds the flipped class when flipped (so css works)', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      this.set('flipped', false);
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "P2pV6vlU",
        "block": "{\"symbols\":[\"card\"],\"statements\":[[5,\"flip-card\",[],[[\"@flipped\"],[[21,\"flipped\"]]],{\"statements\":[[6,[22,1,[\"back\"]],[],[[],[]],{\"statements\":[[0,\"Hello\"]],\"parameters\":[]}]],\"parameters\":[1]}]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.dom('[data-test-flip-card]').hasNoClass('flipped', 'Back starts hidden');
      this.set('flipped', true);
      assert.dom('[data-test-flip-card]').hasClass('flipped', 'Back becomes visible');
    });
  });
});
define("think-system-memorizer/tests/integration/components/libretto-list-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | libretto-list', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders links to librettos', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      this.set('librettos', [{
        label: 'Some Show',
        file: '/files/some-show.txt'
      }, {
        label: 'Some Show 2: Electric Boogaloo',
        file: '/files/some-show2.txt'
      }, {
        label: 'Anything Goes',
        file: '/files/boat.txt'
      }]);
      this.owner.lookup('router:main').setupRouter();
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "GRbQltzK",
        "block": "{\"symbols\":[],\"statements\":[[5,\"libretto-list\",[],[[\"@librettos\"],[[21,\"librettos\"]]]]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.dom('a[href$="some-show"]').containsText('Some Show');
      assert.dom('a[href$="some-show-2-electric-boogaloo"]').containsText('Some Show 2: Electric Boogaloo');
      assert.dom('a[href$="anything-goes"]').containsText('Anything Goes');
    });
  });
});
define("think-system-memorizer/tests/integration/components/scroll-on-init-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | scroll-on-init', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "0MOilBHw",
        "block": "{\"symbols\":[],\"statements\":[[1,[21,\"scroll-on-init\"],false]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "fdquPMxW",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"scroll-on-init\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("think-system-memorizer/tests/integration/components/swiper-loop-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | swiper-loop', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      this.set('things', ['thing1', 'thing2']); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "+9uolccJ",
        "block": "{\"symbols\":[\"item\"],\"statements\":[[0,\"\\n      \"],[5,\"swiper-loop\",[],[[\"@items\",\"@currentIndex\"],[[21,\"things\"],0]],{\"statements\":[[0,\"\\n        \"],[1,[22,1,[]],false],[0,\"\\n      \"]],\"parameters\":[1]}],[0,\"\\n    \"]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.dom('[data-test-swiper-loop]').matchesText(/thing1 ?\s* ?thing2/);
    });
  });
});
define("think-system-memorizer/tests/integration/helpers/slugify-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Helper | slugify', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it renders', async function (assert) {
      this.set('inputValue', 'hi there 2: people');
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "45geNnjF",
        "block": "{\"symbols\":[],\"statements\":[[1,[27,\"slugify\",[[23,[\"inputValue\"]]],null],false]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.dom().containsText('hi-there-2-people');
    });
  });
});
define("think-system-memorizer/tests/lint/app.lint-test", [], function () {
  "use strict";

  QUnit.module('ESLint | app');
  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });
  QUnit.test('components/flip-card/side.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/flip-card/side.js should pass ESLint\n\n');
  });
  QUnit.test('components/libretto-list.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/libretto-list.js should pass ESLint\n\n');
  });
  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });
  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/background-colors.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/background-colors.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/background-size.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/background-size.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/border-colors.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/border-colors.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/border-radius.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/border-radius.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/border-widths.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/border-widths.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/colors.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/colors.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/font-weights.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/font-weights.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/fonts.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/fonts.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/height.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/height.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/letter-spacing.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/letter-spacing.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/line-height.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/line-height.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/margin.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/margin.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/max-height.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/max-height.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/max-width.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/max-width.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/min-height.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/min-height.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/min-width.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/min-width.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/negative-margin.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/negative-margin.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/opacity.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/opacity.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/padding.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/padding.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/screens.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/screens.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/shadows.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/shadows.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/svg-fill.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/svg-fill.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/svg-stroke.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/svg-stroke.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/tailwind.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/tailwind.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/text-colors.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/text-colors.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/text-sizes.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/text-sizes.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/width.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/width.js should pass ESLint\n\n');
  });
  QUnit.test('tailwind/config/z-index.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'tailwind/config/z-index.js should pass ESLint\n\n');
  });
});
define("think-system-memorizer/tests/lint/templates.template.lint-test", [], function () {
  "use strict";

  QUnit.module('TemplateLint');
  QUnit.test('think-system-memorizer/templates/application.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'think-system-memorizer/templates/application.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('think-system-memorizer/templates/components/card-deck.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'think-system-memorizer/templates/components/card-deck.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('think-system-memorizer/templates/components/card-decks-data.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'think-system-memorizer/templates/components/card-decks-data.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('think-system-memorizer/templates/components/flip-card.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'think-system-memorizer/templates/components/flip-card.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('think-system-memorizer/templates/components/flip-card/side.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'think-system-memorizer/templates/components/flip-card/side.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('think-system-memorizer/templates/components/libretto-list.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'think-system-memorizer/templates/components/libretto-list.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('think-system-memorizer/templates/components/scroll-on-init.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'think-system-memorizer/templates/components/scroll-on-init.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('think-system-memorizer/templates/components/swiper-loop.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'think-system-memorizer/templates/components/swiper-loop.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('think-system-memorizer/templates/index.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'think-system-memorizer/templates/index.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('think-system-memorizer/templates/librettos.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'think-system-memorizer/templates/librettos.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('think-system-memorizer/templates/librettos/show.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'think-system-memorizer/templates/librettos/show.hbs should pass TemplateLint.\n\n');
  });
});
define("think-system-memorizer/tests/lint/tests.lint-test", [], function () {
  "use strict";

  QUnit.module('ESLint | tests');
  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });
});
define("think-system-memorizer/tests/test-helper", ["think-system-memorizer/app", "think-system-memorizer/config/environment", "@ember/test-helpers", "ember-qunit"], function (_app, _environment, _testHelpers, _emberQunit) {
  "use strict";

  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));
  (0, _emberQunit.start)();
});
define("think-system-memorizer/tests/unit/controllers/librettos-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | librettos', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:librettos');
      assert.ok(controller);
    });
  });
});
define("think-system-memorizer/tests/unit/controllers/librettos/show-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | librettos/show', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:librettos/show');
      assert.ok(controller);
    });
  });
});
define("think-system-memorizer/tests/unit/reducers/card-decks-test", ["qunit", "ember-qunit", "ember-redux-freeze", "think-system-memorizer/reducers", "think-system-memorizer/tests/factories"], function (_qunit, _emberQunit, _emberReduxFreeze, _reducers, _factories) {
  "use strict";

  // @ts-ignore
  (0, _qunit.module)('Unit | Reducers | card-decks', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('set a new current index', function (assert) {
      const cardDecks = {
        decks: [(0, _factories.create)('cardDeck', {
          name: 'anyDeck',
          currentIndex: 0
        })]
      };
      (0, _emberReduxFreeze.deepFreeze)(cardDecks);
      const result = (0, _reducers.default)({
        cardDecks
      }, {
        type: _reducers.IActionType.SetCardIndex,
        name: 'anyDeck',
        newIndex: 1
      });
      assert.deepEqual(result, {
        cardDecks: {
          decks: [{ ...cardDecks.decks[0],
            currentIndex: 1
          }]
        }
      });
    });
    (0, _qunit.test)('reset all cards to unflipped', function (assert) {
      const cardList1 = (0, _factories.createList)('card', 3, {
        isFlipped: true
      });
      const cardList2 = (0, _factories.createList)('card', 3, {
        isFlipped: true
      });
      const cardDecks = {
        decks: [(0, _factories.create)('cardDeck', {
          name: 'changeDeck',
          cards: cardList1
        }), (0, _factories.create)('cardDeck', {
          name: 'untouchedDeck',
          cards: cardList2
        })]
      };
      (0, _emberReduxFreeze.deepFreeze)(cardDecks);
      const result = (0, _reducers.default)({
        cardDecks
      }, {
        type: _reducers.IActionType.UnflipAllInDeck,
        name: 'changeDeck'
      });
      assert.deepEqual(result, {
        cardDecks: {
          decks: [{ ...cardDecks.decks[0],
            cards: cardList1.map(card => ({ ...card,
              isFlipped: false
            }))
          }, { ...cardDecks.decks[1],
            cards: cardList2
          }]
        }
      });
    });
    (0, _qunit.test)('flip a card, and flip it back', function (assert) {
      const cardList = (0, _factories.createList)('card', 3, {
        isFlipped: false
      });
      const firstId = cardList[0].id;
      const [, ...tail] = cardList;
      const cardDecks = {
        decks: [(0, _factories.create)('cardDeck', {
          name: 'anyDeck',
          cards: cardList
        })]
      };
      (0, _emberReduxFreeze.deepFreeze)(cardDecks);
      const result = (0, _reducers.default)({
        cardDecks
      }, {
        type: _reducers.IActionType.FlipCard,
        id: firstId
      });
      assert.deepEqual(result, {
        cardDecks: {
          decks: [(0, _factories.create)('cardDeck', {
            name: 'anyDeck',
            cards: [{ ...cardList[0],
              isFlipped: true
            }, ...tail]
          })]
        }
      });
      const nextResult = (0, _reducers.default)(result, {
        type: _reducers.IActionType.FlipCard,
        id: firstId
      });
      assert.deepEqual(nextResult, {
        cardDecks: {
          decks: [(0, _factories.create)('cardDeck', {
            name: 'anyDeck',
            cards: [{ ...cardList[0],
              isFlipped: false
            }, ...tail]
          })]
        }
      });
    });
  });
});
define("think-system-memorizer/tests/unit/routes/index-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | index', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:index');
      assert.ok(route);
    });
  });
});
define("think-system-memorizer/tests/unit/routes/librettos-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | librettos', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:librettos');
      assert.ok(route);
    });
  });
});
define("think-system-memorizer/tests/unit/routes/librettos/show-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | librettos/show', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:librettos/show');
      assert.ok(route);
    });
  });
});
define('think-system-memorizer/config/environment', [], function() {
  var prefix = 'think-system-memorizer';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

require('think-system-memorizer/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
