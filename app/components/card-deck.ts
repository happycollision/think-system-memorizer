import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { ICard } from 'think-system-memorizer/reducers';

export default class CardDeckComponent extends Component.extend({
  onCardClick(cardcontent: ICard) {},
}) {
  
  @action cardClick(cardContent: ICard, ev: Event) {
    ev.preventDefault();
    this.get('onCardClick')(cardContent);
  }
}
