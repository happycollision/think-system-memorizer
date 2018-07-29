import { ICard, ICardDeck, ICardDecks } from 'think-system-memorizer/reducers';
import { keyBy } from 'lodash-es';

class Definitions {
  card = (): ICard => ({
    id: getNewId(),
    front: `front content for id ${lastId()}`,
    back: `back content for id ${lastId()}`,
    isFlipped: false,
  })

  cardDeck = (): ICardDeck => ({
    name: `Deck #${getNewId()}`,
    cards: createList('card', 2),
    currentIndex: 0,
  })

  cardDecks = (): ICardDecks => {
    const decks = createList('cardDeck', 2);
    return keyBy(decks, 'name');
  }
}
const definitions = new Definitions();

let incrementor = 1;
function getNewId() {
  return incrementor++;
}

function lastId() {
  return incrementor;
}

function getFactory<T extends keyof Definitions>(faketory: T) {
  if (definitions[faketory] === undefined) {
    throw new Error(`Test factory \`create('${faketory}')\` failed. There is no factory called "${faketory}"`);
  }
  return definitions[faketory]();
}

export function create<T extends keyof Definitions, U extends ReturnType<Definitions[T]>>(faketory: T, overrides?: Partial<U>): U {
  let obj = getFactory(faketory);
  overrides = overrides || {};
  return Object.assign(obj, overrides) as U;
}

export function createList<T extends keyof Definitions, U extends ReturnType<Definitions[T]>>(factory: T, amount: number, overrides?: Partial<U>): U[] {
  return Array.from(new Array(amount)).map(() => create(factory, overrides));
}

export default create;
