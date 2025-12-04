import {
  getLocalStorage,
  LOCAL_STORAGE_KEY_WILDCARD,
} from '../web/getLocalStorage'

export function deleteMMKV(id: string): boolean {
  const storage = getLocalStorage()
  const prefix = id + LOCAL_STORAGE_KEY_WILDCARD
  let wasRemoved = false

  const keys = Object.keys(storage)
  for (const key of keys) {
    if (key.startsWith(prefix)) {
      storage.removeItem(key)
      wasRemoved = true
    }
  }

  return wasRemoved
}
