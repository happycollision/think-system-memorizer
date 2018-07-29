import Component from '@ember/component';
import { computed } from '@ember-decorators/object';

export default class SwiperLoopComponent extends Component {
  @computed() get 'data-test-swiper-loop'() { return true }
}
