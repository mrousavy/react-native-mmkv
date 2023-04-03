/* global localStorage */
import type { MMKVConfiguration, NativeMMKV } from 'react-native-mmkv';
import { createTextEncoder } from './createTextEncoder';

const canUseDOM =
  typeof window !== 'undefined' && window.document?.createElement != null;

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

  if (config.id.indexOf('\\') !== -1) {
    throw new Error('MMKV: `id` cannot contain the backslash character (`\\`)!');
  }

  const keyPrefix = (config.id && config.id !== 'mmkv.default') ? `${config.id}\\` : null;
  const prefixedKey = (key: string) => {
    if (keyPrefix === null) return key;
    return `${keyPrefix}\\${key}`;
  };

  return {
    clearAll: () => storage().clear(),
    delete: (key) => storage().removeItem(prefixedKey(key)),
    set: (key, value) => {
      if (key.indexOf('\\') !== -1) {
        throw new Error('MMKV: `key` cannot contain the backslash character (`\\`)!');
      }
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
      if (keyPrefix === null) return keys;
      return keys.filter(key => key.startsWith(keyPrefix));
    },
    contains: (key) => storage().getItem(prefixedKey(key)) != null,
    recrypt: () => {
      throw new Error('`recrypt(..)` is not supported on Web!');
    },
  };
};
