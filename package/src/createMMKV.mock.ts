import type { NativeMMKV } from './Types';

/* Mock MMKV instance for use in tests */
export const createMockMMKV = (): NativeMMKV => {
  const storage = new Map<string, string | boolean | number | ArrayBuffer>();

  return {
    clearAll: () => storage.clear(),
    delete: (key) => storage.delete(key),
    set: (key, value, expireDuration) => {
      if (
        storage.get('enableAutoKeyExpire') &&
        expireDuration &&
        expireDuration > 0
      ) {
        storage.set(key, value);
        setTimeout(() => {
          storage.delete(key);
        }, expireDuration * 1000);
      } else {
        storage.set(key, value);
      }
    },
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
    get enableAutoKeyExpire(): boolean {
      return storage.get('enableAutoKeyExpire') ? true : false;
    },
    set enableAutoKeyExpire(value: number) {
      if (value === -1) {
        storage.set('enableAutoKeyExpire', false);
      } else {
        storage.set('enableAutoKeyExpire', value);
      }
    },
  };
};
