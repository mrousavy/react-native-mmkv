import {
  getLocalStorage,
  LOCAL_STORAGE_KEY_WILDCARD,
} from '../web/getLocalStorage'

export function existsMMKV(id: string): boolean {
  const storage = getLocalStorage()
  const prefix = id + LOCAL_STORAGE_KEY_WILDCARD
  const keys = Object.keys(storage)
  return keys.some((k) => k.startsWith(prefix))
}
