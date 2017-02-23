import { toType } from './helper-functions';

function storageAvailable(type) {
  try {
    var storage = window[type],
    x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return false;
  }
}

class Persistence {
  constructor (prefix) {
    if (toType(prefix) !== 'string') {
      throw new Error(`The constructor for Persistence requires a prefix (string). ${toType(prefix)} given`);
    }
    this.storageAvailable = storageAvailable('localStorage');
    if (this.storageAvailable) {
      this.storage = window.localStorage;

    }
    this.prefixValue = prefix;
  }

  setItem (key, item) {
    if (!this.storageAvailable) return;
    let type = toType(item);
    let toPersistence = this.prepareItem(item, type);
    this.sendToStorage(key, toPersistence, type);
  }

  getItem (key) {
    if (!this.storageAvailable) return undefined;
    return this.getFromStorage(key);
  }

  sendToStorage (key, preparedItem, type) {
    let prefixedKey = this.prefix(key);
    this.storage.setItem(prefixedKey, preparedItem);
    this.storage.setItem(`${prefixedKey}-Type`, type);
  }

  getFromStorage (key) {
    let prefixedKey = this.prefix(key);
    let type = this.storage.getItem(`${prefixedKey}-Type`);
    let serializedItem = this.storage.getItem(prefixedKey);
    return this.unserialize(serializedItem, type);
  }

  unserialize (serializedItem, type) {
    if (type === 'string') return serializedItem;
    if (type === 'number') return parseInt(serializedItem, 10);
    return JSON.parse(serializedItem);
  }

  prepareItem (item, type) {
    switch(type) {
      case 'object':
      case 'array':
        return JSON.stringify(item);
      case 'string':
        return item;
      case 'number':
        return item.toString();
      default:
        throw new Error(`Only objects, arrays, numbers, and strings can be stored. ${type} was given.`);
    }
  }

  prefix (key) {
    return `${this.prefixValue}-${key}`;
  }
}

export default Persistence;
