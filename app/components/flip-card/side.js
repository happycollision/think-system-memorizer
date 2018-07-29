import Component from '@ember/component';
import { computed } from '@ember-decorators/object';

export default class FlipCardSideComponent extends Component {
  @computed() get 'data-test-card-side'() { return 1; } // for testing only
}
