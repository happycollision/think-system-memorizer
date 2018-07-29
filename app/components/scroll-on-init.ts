import Component from '@ember/component';

export default class ScrollOnInitComponent extends Component {
  didInsertElement() {
    // @ts-ignore (arguments is okay here)
    super.didInsertElement(...arguments);
    
    this.get('element').scrollIntoView()
  }
}
