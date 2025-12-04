import type { MMKV } from '../specs/MMKV.nitro'
import type { Configuration } from '../specs/MMKVFactory.nitro'
import { createTextEncoder } from '../web/createTextEncoder'
import {
  getLocalStorage,
  LOCAL_STORAGE_KEY_WILDCARD,
} from '../web/getLocalStorage'

export function createMMKV(
  config: Configuration = { id: 'mmkv.default' }
): MMKV {
  if (config.encryptionKey != null) {
    throw new Error("MMKV: 'encryptionKey' is not supported on Web!")
  }
  if (config.path != null) {
    throw new Error("MMKV: 'path' is not supported on Web!")
  }

  const textEncoder = createTextEncoder()
  const listeners = new Set<(key: string) => void>()

  if (config.id.includes(LOCAL_STORAGE_KEY_WILDCARD)) {
    throw new Error('MMKV: `id` cannot contain the backslash character (`\\`)!')
  }

  const keyPrefix = `${config.id}${LOCAL_STORAGE_KEY_WILDCARD}` // mmkv.default\\
  const prefixedKey = (key: string) => {
    if (key.includes('\\')) {
      throw new Error(
        'MMKV: `key` cannot contain the backslash character (`\\`)!'
      )
    }
    return `${keyPrefix}${key}`
  }

  const callListeners = (key: string) => {
    listeners.forEach((l) => l(key))
  }

  return {
    id: config.id,
    size: 0,
    isReadOnly: false,
    clearAll: () => {
      const storage = getLocalStorage()
      const keys = Object.keys(storage)
      for (const key of keys) {
        if (key.startsWith(keyPrefix)) {
          storage.removeItem(key)
          callListeners(key)
        }
      }
    },
    remove: (key) => {
      const storage = getLocalStorage()
      storage.removeItem(prefixedKey(key))
      const wasRemoved = storage.getItem(prefixedKey(key)) === null
      if (wasRemoved) callListeners(key)
      return wasRemoved
    },
    set: (key, value) => {
      const storage = getLocalStorage()
      if (key === '') throw new Error('Cannot set a value for an empty key!')
      storage.setItem(prefixedKey(key), value.toString())
      callListeners(key)
    },
    getString: (key) => {
      const storage = getLocalStorage()
      return storage.getItem(prefixedKey(key)) ?? undefined
    },
    getNumber: (key) => {
      const storage = getLocalStorage()
      const value = storage.getItem(prefixedKey(key))
      if (value == null) return undefined
      return Number(value)
    },
    getBoolean: (key) => {
      const storage = getLocalStorage()
      const value = storage.getItem(prefixedKey(key))
      if (value == null) return undefined
      return value === 'true'
    },
    getBuffer: (key) => {
      const storage = getLocalStorage()
      const value = storage.getItem(prefixedKey(key))
      if (value == null) return undefined
      return textEncoder.encode(value).buffer
    },
    getAllKeys: () => {
      const storage = getLocalStorage()
      const keys = Object.keys(storage)
      return keys
        .filter((key) => key.startsWith(keyPrefix))
        .map((key) => key.slice(keyPrefix.length))
    },
    contains: (key) => {
      const storage = getLocalStorage()
      return storage.getItem(prefixedKey(key)) != null
    },
    recrypt: () => {
      throw new Error('`recrypt(..)` is not supported on Web!')
    },
    trim: () => {
      // no-op
    },
    dispose: () => {},
    equals: () => false,
    name: 'MMKV',
    addOnValueChangedListener: (listener) => {
      listeners.add(listener)
      return {
        remove: () => {
          listeners.delete(listener)
        },
      }
    },
    importAllFrom: (other) => {
      const storage = getLocalStorage()
      const keys = other.getAllKeys()
      let imported = 0
      for (const key of keys) {
        const string = other.getString(key)
        if (string != null) {
          storage.set(key, string)
          imported++
        }
      }
      return imported
    },
  }
}
