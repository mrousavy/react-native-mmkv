/* global localStorage */
import type { MMKVConfiguration, NativeMMKV } from 'react-native-mmkv';
import { createTextEncoder } from './createTextEncoder';

const canUseDOM =
  typeof window !== 'undefined' && window.document?.createElement != null;

export const createMMKV = (config: MMKVConfiguration): NativeMMKV => {
  if (config.id !== 'mmkv.default') {
    throw new Error("MMKV: 'id' is not supported on Web!");
  }
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

  return {
    clearAll: () => storage().clear(),
    delete: (key) => storage().removeItem(key),
    set: (key, value) => storage().setItem(key, value.toString()),
    getString: (key) => storage().getItem(key) ?? undefined,
    getNumber: (key) => {
      const value = storage().getItem(key);
      if (value == null) return undefined;
      return Number(value);
    },
    getBoolean: (key) => {
      const value = storage().getItem(key);
      if (value == null) return undefined;
      return value === 'true';
    },
    getBuffer: (key) => {
      const value = storage().getItem(key);
      if (value == null) return undefined;
      return textEncoder.encode(value);
    },
    getAllKeys: () => Object.keys(storage()),
    contains: (key) => storage().getItem(key) != null,
    trim: () => {},
    recrypt: () => {
      throw new Error('`recrypt(..)` is not supported on Web!');
    },
  };
};
