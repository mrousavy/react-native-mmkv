import type { MMKVConfiguration, MMKVInterface } from 'react-native-mmkv';

export const createMMKV = (config: MMKVConfiguration): MMKVInterface => {
  const prefix = config.id;
  // TODO: Implement Encryption
  // TODO: Implement custom Path?
  return {
    clearAll: () => localStorage.clear(),
    delete: (key) => localStorage.removeItem(`${prefix}.${key}`),
    set: (key, value) => localStorage.setItem(`${prefix}.${key}`, value),
    getString: (key) => localStorage.getItem(`${prefix}.${key}`) ?? undefined,
    getNumber: (key) => Number(localStorage.getItem(`${prefix}.${key}`) ?? 0),
    getBoolean: (key) =>
      Boolean(localStorage.getItem(`${prefix}.${key}`) ?? false),
    getAllKeys: () =>
      Object.keys(localStorage).map((key) => key.replace(`${prefix}.`, '')),
  };
};
