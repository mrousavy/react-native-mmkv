/* global localStorage */
import type { Configuration, NativeMMKV } from './Types';
import localforage from 'localforage';
import { createTextEncoder } from './createTextEncoder'; // Import createTextEncoder

const canUseDOM =
  typeof window !== 'undefined' && window.document?.createElement != null;

const hasAccessToLocalStorage = () => {
  try {
    // Check for localStorage access
    window.localStorage;

    // Check for IndexedDB availability
    if (!window.indexedDB) {
      throw new Error('IndexedDB is not available');
    }

    return true;
  } catch {
    return false;
  }
};

const KEY_WILDCARD = '\\';
const inMemoryStorage = new Map<string, string>();

export const createMMKV = (config: Configuration): NativeMMKV => {
  if (config.encryptionKey != null) {
    throw new Error("MMKV: 'encryptionKey' is not supported on Web!");
  }
  if (config.path != null) {
    throw new Error("MMKV: 'path' is not supported on Web!");
  }

  const keyPrefix = `${config.id}${KEY_WILDCARD}`; // e.g., "mmkv.default\"

  // Helper function to prefix keys with instance ID
  const prefixedKey = (key: string) => {
    if (key.includes(KEY_WILDCARD)) {
      throw new Error(
        'MMKV: `key` cannot contain the backslash character (`\\`)!'
      );
    }
    return `${keyPrefix}${key}`;
  };

  const storage = (): NativeMMKV => {
    if (!canUseDOM) {
      throw new Error(
        'Tried to access storage on the server. Did you forget to call this in useEffect?'
      );
    }

    if (!hasAccessToLocalStorage()) {
      return {
        set: async (key, value) => {
          if (typeof value === 'boolean' || typeof value === 'number') {
            inMemoryStorage.set(prefixedKey(key), value.toString());
          } else if (value instanceof ArrayBuffer) {
            const bufferString = new TextDecoder().decode(value);
            inMemoryStorage.set(prefixedKey(key), bufferString);
          } else {
            inMemoryStorage.set(prefixedKey(key), value);
          }
        },
        getBoolean: async (key) => {
          const value = inMemoryStorage.get(prefixedKey(key));
          if (value == null) return undefined;
          return value === 'true';
        },
        getString: async (key) =>
          inMemoryStorage.get(prefixedKey(key)) ?? undefined,
        getNumber: async (key) => {
          const value = inMemoryStorage.get(prefixedKey(key));
          if (value == null) return undefined;
          return Number(value);
        },
        getBuffer: async (key) => {
          const value = inMemoryStorage.get(prefixedKey(key));
          if (value == null) return undefined;
          return createTextEncoder().encode(value).buffer;
        },
        contains: async (key) => inMemoryStorage.has(prefixedKey(key)),
        delete: async (key) => {
          inMemoryStorage.delete(prefixedKey(key));
          return Promise.resolve();
        },
        getAllKeys: async () => {
          const keys = Array.from(inMemoryStorage.keys());
          return keys
            .filter((key) => key.startsWith(keyPrefix))
            .map((key) => key.slice(keyPrefix.length));
        },
        clearAll: async () => {
          const keys = Array.from(inMemoryStorage.keys());
          for (const key of keys) {
            if (key.startsWith(keyPrefix)) {
              inMemoryStorage.delete(key);
            }
          }
        },
        recrypt: async (encryptionKey?: string) => {
          if (encryptionKey) {
            throw new Error('Encryption is not supported in in-memory storage!');
          }
        },
        trim: async () => {
          // No-op for in-memory storage
        },
        get size() {
          let totalSize = 0;
          for (const [key, value] of inMemoryStorage.entries()) {
            if (key.startsWith(keyPrefix)) {
              totalSize += new Blob([value]).size;
            }
          }
          return Promise.resolve(totalSize);
        },
        get isReadOnly() {
          return false;
        },
      };
    }

    // Initialize localforage
    localforage.config({
      name: 'mmkv-storage',
      storeName: config.id,
    });

    return {
      set: async (key, value) => {
        if (typeof value === 'boolean' || typeof value === 'number') {
          await localforage.setItem(prefixedKey(key), value.toString());
        } else if (value instanceof ArrayBuffer) {
          const bufferString = new TextDecoder().decode(value);
          await localforage.setItem(prefixedKey(key), bufferString);
        } else {
          await localforage.setItem(prefixedKey(key), value);
        }
      },
      getBoolean: async (key) => {
        const value = await localforage.getItem<string>(prefixedKey(key));
        if (value == null) return undefined;
        return value === 'true';
      },
      getString: async (key) =>
        (await localforage.getItem<string>(prefixedKey(key))) ?? undefined,
      getNumber: async (key) => {
        const value = await localforage.getItem<string>(prefixedKey(key));
        if (value == null) return undefined;
        return Number(value);
      },
      getBuffer: async (key) => {
        const value = await localforage.getItem<string>(prefixedKey(key));
        if (value == null) return undefined;
        return createTextEncoder().encode(value).buffer;
      },
      contains: async (key) =>
        (await localforage.getItem(prefixedKey(key))) != null,
      delete: async (key) => await localforage.removeItem(prefixedKey(key)),
      getAllKeys: async () => {
        const keys = await localforage.keys();
        return keys
          .filter((key) => key.startsWith(keyPrefix))
          .map((key) => key.slice(keyPrefix.length));
      },
      clearAll: async () => {
        const keys = await localforage.keys();
        for (const key of keys) {
          if (key.startsWith(keyPrefix)) {
            await localforage.removeItem(key);
          }
        }
      },
      recrypt: async (encryptionKey?: string) => {
        if (encryptionKey) {
          throw new Error('Encryption is not supported in web storage!');
        }
      },
      trim: async () => {
        // Clean up invalid or corrupted entries
        const keys = await localforage.keys();
        for (const key of keys) {
          if (key.startsWith(keyPrefix)) {
            try {
              const value = await localforage.getItem(key);
              if (!value) {
                await localforage.removeItem(key);
              }
            } catch {
              await localforage.removeItem(key);
            }
          }
        }
      },
      get size() {
        return (async () => {
          let totalSize = 0;
          const keys = await localforage.keys();
          for (const key of keys) {
            if (key.startsWith(keyPrefix)) {
              const value = await localforage.getItem(key);
              if (value) {
                totalSize += new Blob([value.toString()]).size;
              }
            }
          }
          return totalSize;
        })();
      },
      get isReadOnly() {
        return false;
      },
    };
  };

  return storage();
};
