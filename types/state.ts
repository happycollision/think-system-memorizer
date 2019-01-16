export interface ICard {
  id: string | number;
  front: HTMLElement | string;
  back: HTMLElement | string;
  isFlipped: boolean;
}

export interface ICardDeck {
  name: string;
  cards: Array<ICard>;
  currentIndex: number;
}

export interface CardDecksState {
  decks: ICardDeck[]
}

export interface StoreState {
  cardDecks: CardDecksState;
}