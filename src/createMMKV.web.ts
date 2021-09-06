/* global localStorage */
import { Platform } from 'react-native';
import type { MMKVConfiguration, MMKVInterface } from 'react-native-mmkv';

const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

export const createMMKV = (config: MMKVConfiguration): MMKVInterface => {
  const storage = () => {
    if (!canUseDOM) {
      throw new Error(
        'Tried to access storage on the server. Did you forget to call this in useEffect?'
      );
    }
    const domStorage =
      global?.localStorage ?? window?.localStorage ?? localStorage;
    if (!domStorage) {
      throw new Error(
        `Could not find 'localStorage' instance! Platform: ${Platform.OS}`
      );
    }
    return domStorage;
  };

  // TODO: Support custom instances?
  // TODO: Implement Encryption
  // TODO: Implement custom Path?
  return {
    clearAll: () => storage().clear(),
    delete: (key) => storage().removeItem(key),
    set: (key, value) => storage().setItem(key, value),
    getString: (key) => storage().getItem(key) ?? undefined,
    getNumber: (key) => Number(storage().getItem(key) ?? 0),
    getBoolean: (key) => Boolean(storage().getItem(key) ?? false),
    getAllKeys: () => Object.keys(storage()),
  };
};
