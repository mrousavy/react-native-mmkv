/* global localStorage */
import type { MMKVConfiguration, NativeMMKV } from 'react-native-mmkv';
import { createTextEncoder } from './createTextEncoder';

const canUseDOM =
  typeof window !== 'undefined' && window.document?.createElement != null;

const KEY_WILDCARD = "\\"

export const createMMKV = (config: MMKVConfiguration): NativeMMKV => {
  if (config.encryptionKey != null) {
    throw new Error("MMKV: 'encryptionKey' is not supported on Web!");
  }
  if (config.path != null) {
    throw new Error("MMKV: 'path' is not supported on Web!");
  }

  const storage = () => {
    if (!canUseDOM) {
      throw new Error(
        'Tried to access storage on the server. Did you forget to call this in useEffect?'
      );
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
    throw new Error('MMKV: `id` cannot contain the backslash character (`\\`)!');
  }

  const keyPrefix = `${config.id}${KEY_WILDCARD}` // mmkv.default\\
  const prefixedKey = (key: string) => {
    if (key.includes('\\')) {
      throw new Error('MMKV: `key` cannot contain the backslash character (`\\`)!');
    }
    return `${keyPrefix}${key}`
  }

  return {
    clearAll: () => {
      const keys = Object.keys(storage())
      for (const key of keys) {
        if (key.startsWith(keyPrefix)) {
          storage().removeItem(key)
        }
      }
    },
    delete: (key) => storage().removeItem(prefixedKey(key)),
    set: (key, value) => {
      storage().setItem(prefixedKey(key), value.toString())
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
      return keys.filter(key => key.startsWith(keyPrefix));
    },
    contains: (key) => storage().getItem(prefixedKey(key)) != null,
    recrypt: () => {
      throw new Error('`recrypt(..)` is not supported on Web!');
    },
  };
};
