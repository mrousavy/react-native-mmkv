import type { MMKVConfiguration, MMKVInterface } from 'react-native-mmkv';

// @ts-expect-error global func is a native JSI func
export const createMMKV = (config: MMKVConfiguration): MMKVInterface => {
  // TODO: Implement custom ID
  // TODO: Implement Encryption
  // TODO: Implement custom Path?
  return {
    clearAll: () => localStorage.clear(),
    delete: (key) => localStorage.removeItem(key),
    set: (key, value) => localStorage.setItem(key, value),
    getString: (key) => localStorage.getItem(key),
    getNumber: (key) => Number(localStorage.getItem(key)),
    getBoolean: (key) => Boolean(localStorage.getItem(key)),
    getAllKeys: () => Object.keys(localStorage),
  };
};
