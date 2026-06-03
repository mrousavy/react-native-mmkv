import {
  getLocalStorage,
  LOCAL_STORAGE_KEY_WILDCARD,
} from '../web/getLocalStorage'

export function existsMMKV(id: string, path?: string): boolean {
  if (path != null) {
    throw new Error("MMKV: 'path' is not supported on Web!")
  }

  const storage = getLocalStorage()
  const prefix = id + LOCAL_STORAGE_KEY_WILDCARD
  const keys = Object.keys(storage)
  return keys.some((k) => k.startsWith(prefix))
}
