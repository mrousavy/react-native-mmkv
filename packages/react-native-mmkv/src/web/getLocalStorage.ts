export const LOCAL_STORAGE_KEY_WILDCARD = '\\'

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
const inMemoryStorage = new Map<string, string>()

export function getLocalStorage(): Storage {
  if (!canUseDOM) {
    throw new Error(
      'Tried to access storage on the server. Did you forget to call this in useEffect?'
    )
  }

  if (!hasAccessToLocalStorage()) {
    return {
      getItem: (key: string) => inMemoryStorage.get(key) ?? null,
      setItem: (key: string, value: string) => inMemoryStorage.set(key, value),
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
