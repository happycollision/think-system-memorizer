import Route from '@ember/routing/route';
import { slugify } from '../../helpers/slugify';
import { ILibrettoListing } from 'think-system-memorizer/routes/librettos';
import { hash } from 'rsvp';

export default class LibrettosShowRoute extends Route {
  model({dasherized_name}: {dasherized_name: string}) {
    const librettos: ILibrettoListing[] = this.modelFor('librettos') as ILibrettoListing[];
    const metadata = librettos.find(lib => slugify([lib.label]) === dasherized_name);
    if (!metadata) { throw new Error('no metadata found for libretto route ' + dasherized_name)}
    return hash({
      metadata,
      text: fetch(metadata.file).then(response => response.text()),
    })
  }
}
