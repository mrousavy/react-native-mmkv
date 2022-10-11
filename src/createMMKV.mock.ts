import type { NativeMMKV } from 'react-native-mmkv';

/* Mock MMKV instance for use in tests */
export const createMockMMKV = (): NativeMMKV => {
  const storage = new Map<string, string | boolean | number>();

  return {
    clearAll: () => storage.clear(),
    delete: (key) => storage.delete(key),
    set: (key, value) => storage.set(key, value),
    getString: (key) => {
      const result = storage.get(key);
      return typeof result === 'string' ? result : undefined;
    },
    getNumber: (key) => {
      const result = storage.get(key);
      return typeof result === 'number' ? result : undefined;
    },
    getBoolean: (key) => {
      const result = storage.get(key);
      return typeof result === 'boolean' ? result : undefined;
    },
    getAllKeys: () => Array.from(storage.keys()),
    contains: (key) => storage.has(key),
    trim: () => {},
    recrypt: () => {
      console.warn('Encryption is not supported in mocked MMKV instances!');
    },
  };
};
