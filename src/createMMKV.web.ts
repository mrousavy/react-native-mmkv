/* global localStorage */
import { Platform } from 'react-native';
import type { MMKVConfiguration, MMKVInterface } from 'react-native-mmkv';

export const createMMKV = (config: MMKVConfiguration): MMKVInterface => {
  // @ts-expect-error
  const storage = global.localStorage ?? window.localStorage ?? localStorage;
  if (storage == null) {
    throw new Error(
      `Could not find 'localStorage' instance! Platform: ${Platform.OS}`
    );
  }
  const prefix = config.id;
  // TODO: Implement Encryption
  // TODO: Implement custom Path?
  return {
    clearAll: () => storage.clear(),
    delete: (key) => storage.removeItem(`${prefix}.${key}`),
    set: (key, value) => storage.setItem(`${prefix}.${key}`, value),
    getString: (key) => storage.getItem(`${prefix}.${key}`) ?? undefined,
    getNumber: (key) => Number(storage.getItem(`${prefix}.${key}`) ?? 0),
    getBoolean: (key) => Boolean(storage.getItem(`${prefix}.${key}`) ?? false),
    getAllKeys: () =>
      Object.keys(storage).map((key) => key.substring(prefix.length + 1)),
  };
};
