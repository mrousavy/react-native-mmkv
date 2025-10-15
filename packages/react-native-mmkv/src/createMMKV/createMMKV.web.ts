import type { MMKV } from '../specs/MMKV.nitro'
import type { Configuration } from '../specs/MMKVFactory.nitro'
import { createTextEncoder } from '../web/createTextEncoder'

const canUseDOM =
  typeof window !== 'undefined' && window.document?.createElement != null

const hasAccessToLocalStorage = () => {
  try {
    // throws ACCESS_DENIED error
    window.localStorage

    return true
  } catch {
    return false
  }
}

const KEY_WILDCARD = '\\'
const inMemoryStorage = new Map<string, string>()

export function createMMKV(
  config: Configuration = { id: 'mmkv.default' }
): MMKV {
  if (config.encryptionKey != null) {
    throw new Error("MMKV: 'encryptionKey' is not supported on Web!")
  }
  if (config.path != null) {
    throw new Error("MMKV: 'path' is not supported on Web!")
  }

  // canUseDOM check prevents spam in Node server environments, such as Next.js server side props.
  if (!hasAccessToLocalStorage() && canUseDOM) {
    console.warn(
      'MMKV: LocalStorage has been disabled. Your experience will be limited to in-memory storage!'
    )
  }

  const storage = () => {
    if (!canUseDOM) {
      throw new Error(
        'Tried to access storage on the server. Did you forget to call this in useEffect?'
      )
    }

    if (!hasAccessToLocalStorage()) {
      return {
        getItem: (key: string) => inMemoryStorage.get(key) ?? null,
        setItem: (key: string, value: string) =>
          inMemoryStorage.set(key, value),
        removeItem: (key: string) => inMemoryStorage.delete(key),
        clear: () => inMemoryStorage.clear(),
        length: inMemoryStorage.size,
        key: (index: number) => Object.keys(inMemoryStorage).at(index) ?? null,
      } as Storage
    }

    const domStorage =
      global?.localStorage ?? window?.localStorage ?? localStorage
    if (domStorage == null) {
      throw new Error(`Could not find 'localStorage' instance!`)
    }
    return domStorage
  }

  const textEncoder = createTextEncoder()
  const listeners = new Set<(key: string) => void>()

  if (config.id.includes(KEY_WILDCARD)) {
    throw new Error('MMKV: `id` cannot contain the backslash character (`\\`)!')
  }

  const keyPrefix = `${config.id}${KEY_WILDCARD}` // mmkv.default\\
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
    clearAll: () => {
      const keys = Object.keys(storage())
      for (const key of keys) {
        if (key.startsWith(keyPrefix)) {
          storage().removeItem(key)
          callListeners(key)
        }
      }
    },
    remove: (key) => {
      const wasRemoved = storage().removeItem(prefixedKey(key)) ?? false
      if (wasRemoved) callListeners(key)
      return wasRemoved
    },
    set: (key, value) => {
      if (key === '') throw new Error('Cannot set a value for an empty key!')
      storage().setItem(prefixedKey(key), value.toString())
      callListeners(key)
    },
    getString: (key) => storage().getItem(prefixedKey(key)) ?? undefined,
    getNumber: (key) => {
      const value = storage().getItem(prefixedKey(key))
      if (value == null) return undefined
      return Number(value)
    },
    getBoolean: (key) => {
      const value = storage().getItem(prefixedKey(key))
      if (value == null) return undefined
      return value === 'true'
    },
    getBuffer: (key) => {
      const value = storage().getItem(prefixedKey(key))
      if (value == null) return undefined
      return textEncoder.encode(value).buffer
    },
    getAllKeys: () => {
      const keys = Object.keys(storage())
      return keys
        .filter((key) => key.startsWith(keyPrefix))
        .map((key) => key.slice(keyPrefix.length))
    },
    contains: (key) => storage().getItem(prefixedKey(key)) != null,
    recrypt: () => {
      throw new Error('`recrypt(..)` is not supported on Web!')
    },
    size: 0,
    isReadOnly: false,
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
  }
}
