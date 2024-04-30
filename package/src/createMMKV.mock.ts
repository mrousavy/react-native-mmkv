import type { NativeMMKV } from './Types';

/* Mock MMKV instance for use in tests */
export const createMockMMKV = (): NativeMMKV => {
  const storage = new Map<string, string | boolean | number | ArrayBuffer>();

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
    getBuffer: (key) => {
      const result = storage.get(key);
      return result instanceof ArrayBuffer ? result : undefined;
    },
    getAllKeys: () => Array.from(storage.keys()),
    contains: (key) => storage.has(key),
    recrypt: () => {
      console.warn('Encryption is not supported in mocked MMKV instances!');
    },
    size: 0,
    trim: () => {
      // no-op
    },
  };
};
