import Route from '@ember/routing/route';

export interface ILibrettoListing {
  label: string;
  file: string;
}

export default class LibrettosRoute extends Route {
  model(): ILibrettoListing[] {
    return [
      {label: 'Bridges: Robert', file: '/files/Bridges.txt'}
    ]
  }
}
