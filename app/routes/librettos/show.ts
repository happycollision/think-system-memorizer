import Route from '@ember/routing/route';
import {slugify} from '../../helpers/slugify';
import { ILibrettoListing } from 'think-system-memorizer/routes/librettos';

export default class LibrettosShowRoute extends Route {
  model({dasherized_name}: {dasherized_name: string}) {
    const librettos: ILibrettoListing[] = this.modelFor('librettos') as ILibrettoListing[];
    return librettos.find(lib => slugify([lib.label]) === dasherized_name);
  }
}
