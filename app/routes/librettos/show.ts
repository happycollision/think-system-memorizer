import Route from '@ember/routing/route';
import { slugify } from '../../helpers/slugify';
import { ILibrettoListing } from 'think-system-memorizer/routes/librettos';
import { hash } from 'rsvp';
import { service } from '@ember-decorators/service'
import { IRegisteredAction, IActionType, ICard } from 'think-system-memorizer/reducers';
import { action } from '@ember-decorators/object';

export default class LibrettosShowRoute extends Route.extend({
  queryParams: {
    card: {
      replace: true
    }
  }

}) {
  @service('redux') redux!: ReduxService;

  model({dasherized_name}: {dasherized_name: string}) {
    const redux = this.get('redux');
    const librettos: ILibrettoListing[] = this.modelFor('librettos') as ILibrettoListing[];
    const metadata = librettos.find(lib => slugify([lib.label]) === dasherized_name);

    if (!metadata) { throw new Error('no metadata found for libretto route ' + dasherized_name)}

    return hash({
      name: metadata.label,
      noOp: fetch(metadata.file).then(response => response.text())
        .then(text => redux.dispatch({type: IActionType.RegisterText, name: metadata.label, text} as IRegisteredAction.RegisterTest))
    })
  }

  @action handleCardClick(cardContent: ICard) {
    this.get('redux').dispatch({type: IActionType.FlipCard, card: cardContent})
  }
}
