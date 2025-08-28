import type { MMKV } from '../specs/MMKV.nitro'

/**
 * Mock MMKV instance when used in a Jest/Test environment.
 */
export function createMockMMKV(): MMKV {
  const storage = new Map<string, string | boolean | number | ArrayBuffer>()
  const listeners = new Set<(key: string) => void>()

  return {
    clearAll: () => storage.clear(),
    remove: (key) => storage.delete(key),
    set: (key, value) => storage.set(key, value),
    getString: (key) => {
      const result = storage.get(key)
      return typeof result === 'string' ? result : undefined
    },
    getNumber: (key) => {
      const result = storage.get(key)
      return typeof result === 'number' ? result : undefined
    },
    getBoolean: (key) => {
      const result = storage.get(key)
      return typeof result === 'boolean' ? result : undefined
    },
    getBuffer: (key) => {
      const result = storage.get(key)
      return result instanceof ArrayBuffer ? result : undefined
    },
    getAllKeys: () => Array.from(storage.keys()),
    contains: (key) => storage.has(key),
    recrypt: () => {
      console.warn('Encryption is not supported in mocked MMKV instances!')
    },
    get size(): number {
      return storage.size
    },
    isReadOnly: false,
    trim: () => {
      // no-op
    },
    name: 'MMKV',
    dispose: () => {},
    equals: () => {
      return false
    },
    addOnValueChangedListener: (listener) => {
      listeners.add(listener)
      return {
        remove: () => {
          listeners.delete(listener)
        },
      }
    },
  }
}
