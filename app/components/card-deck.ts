import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { ICard } from 'think-system-memorizer/reducers';

export default class CardDeckComponent extends Component.extend({
  tagName: '',
  // @ts-ignore (by default it *should* do nothing, but the args need to be right)
  onCardClick(cardId: number|string) {}, // pass in to override
}) {
  
  @action cardClick(cardContent: ICard, ev: Event) {
    ev.preventDefault();
    this.get('onCardClick')(cardContent.id);
  }
}
