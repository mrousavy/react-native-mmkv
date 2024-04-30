/* global localStorage */
import type { Configuration } from './MMKV';
import type { NativeMMKV } from './Types';
import { createTextEncoder } from './createTextEncoder';

const canUseDOM =
  typeof window !== 'undefined' && window.document?.createElement != null;

const hasAccessToLocalStorage = () => {
  try {
    // throws ACCESS_DENIED error
    window.localStorage;

    return true;
  } catch {
    return false;
  }
};

const KEY_WILDCARD = '\\';
const inMemoryStorage = new Map<string, string>();

export const createMMKV = (config: Configuration): NativeMMKV => {
  if (config.encryptionKey != null) {
    throw new Error("MMKV: 'encryptionKey' is not supported on Web!");
  }
  if (config.path != null) {
    throw new Error("MMKV: 'path' is not supported on Web!");
  }

  // canUseDOM check prevents spam in Node server environments, such as Next.js server side props.
  if (!hasAccessToLocalStorage() && canUseDOM) {
    console.warn(
      'MMKV: LocalStorage has been disabled. Your experience will be limited to in-memory storage!'
    );
  }

  const storage = () => {
    if (!canUseDOM) {
      throw new Error(
        'Tried to access storage on the server. Did you forget to call this in useEffect?'
      );
    }

    if (!hasAccessToLocalStorage()) {
      return {
        getItem: (key: string) => inMemoryStorage.get(key) ?? null,
        setItem: (key: string, value: string) =>
          inMemoryStorage.set(key, value),
        removeItem: (key: string) => inMemoryStorage.delete(key),
        clear: () => inMemoryStorage.clear(),
        length: inMemoryStorage.size,
        key: (index: number) => Object.keys(inMemoryStorage).at(index) ?? null,
      } as Storage;
    }

    const domStorage =
      global?.localStorage ?? window?.localStorage ?? localStorage;
    if (domStorage == null) {
      throw new Error(`Could not find 'localStorage' instance!`);
    }
    return domStorage;
  };

  const textEncoder = createTextEncoder();

  if (config.id.includes(KEY_WILDCARD)) {
    throw new Error(
      'MMKV: `id` cannot contain the backslash character (`\\`)!'
    );
  }

  const keyPrefix = `${config.id}${KEY_WILDCARD}`; // mmkv.default\\
  const prefixedKey = (key: string) => {
    if (key.includes('\\')) {
      throw new Error(
        'MMKV: `key` cannot contain the backslash character (`\\`)!'
      );
    }
    return `${keyPrefix}${key}`;
  };

  return {
    clearAll: () => {
      const keys = Object.keys(storage());
      for (const key of keys) {
        if (key.startsWith(keyPrefix)) {
          storage().removeItem(key);
        }
      }
    },
    delete: (key) => storage().removeItem(prefixedKey(key)),
    set: (key, value) => {
      storage().setItem(prefixedKey(key), value.toString());
    },
    getString: (key) => storage().getItem(prefixedKey(key)) ?? undefined,
    getNumber: (key) => {
      const value = storage().getItem(prefixedKey(key));
      if (value == null) return undefined;
      return Number(value);
    },
    getBoolean: (key) => {
      const value = storage().getItem(prefixedKey(key));
      if (value == null) return undefined;
      return value === 'true';
    },
    getBuffer: (key) => {
      const value = storage().getItem(prefixedKey(key));
      if (value == null) return undefined;
      return textEncoder.encode(value);
    },
    getAllKeys: () => {
      const keys = Object.keys(storage());
      return keys
        .filter((key) => key.startsWith(keyPrefix))
        .map((key) => key.slice(keyPrefix.length));
    },
    contains: (key) => storage().getItem(prefixedKey(key)) != null,
    recrypt: () => {
      throw new Error('`recrypt(..)` is not supported on Web!');
    },
    size: 0,
    trim: () => {
      // no-op
    },
  };
};
