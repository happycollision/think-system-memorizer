import Component from '@ember/component';
import { computed } from '@ember-decorators/object';

export default class FlipCardComponent extends Component {
  @computed() get 'data-test-flip-card'() { return 1; } // for testing only
  get classNameBindings(): string[] { return ['flipped']}
}
