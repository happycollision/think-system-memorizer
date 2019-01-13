import Route from '@ember/routing/route';

export interface ILibrettoListing {
  label: string;
  file: string;
}

export default class LibrettosRoute extends Route {
  model(): ILibrettoListing[] {
    return [
      {label: 'Diamonds & Divas: Adam', file: '/files/DiamondsAdam.txt'},
      {label: 'Diamonds & Divas: Jimmy', file: '/files/Diamonds.txt'},
      {label: 'Hairspray: Corny', file: '/files/Hairspray.txt'},
      {label: 'Bridges: Robert', file: '/files/Bridges.txt'},
      {label: 'Elf: Jovie', file: '/files/Elf.txt'},
      {label: 'Grease: Kenicke', file: '/files/Grease.txt'},
      {label: 'Zombie Prom: Jonny', file: '/files/ZombieProm.txt'},
      {label: 'Music Man: Harold', file: '/files/MusicManHaroldHill.txt'},
      {label: 'Music Man: Marian', file: '/files/MusicManMarian.txt'},
    ]
  }
}
