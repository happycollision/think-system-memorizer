import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';

export default class LibrettosController extends Controller {
  @service('router') router: any;

  @computed('router.currentRouteName')
  get isActiveRoute(): boolean {
    return this.get('router').currentRouteName === 'librettos.index'
  }
}
