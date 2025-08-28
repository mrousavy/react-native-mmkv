import { useState } from 'react'
import type { MMKV } from '../specs/MMKV.nitro'
import { getDefaultMMKVInstance } from '../createMMKV/getDefaultMMKVInstance'
import { useMMKVListener } from './useMMKVListener'

/**
 * Get a list of all keys that exist in the given MMKV {@linkcode instance}.
 * The keys update when new keys are added or removed.
 * @param instance The instance to listen to changes to (or the default instance)
 *
 * @example
 * ```ts
 * useMMKVKeys(instance)
 * ```
 */
export function useMMKVKeys(
  instance?: MMKV
): string[] {
  const mmkv = instance ?? getDefaultMMKVInstance()
  const [keys, setKeys] = useState<string[]>(() => mmkv.getAllKeys())

  useMMKVListener((key) => {
    // a key changed
    setKeys((keys) => {
      const contains = mmkv.contains(key)
      const currentlyContains = keys.includes(key)
      if (contains === currentlyContains) {
      }
      if (contains && !currentlyContains) {
        // the key got added - add it to our state
        return [...keys, key]
      } else if (!contains && currentlyContains) {
        // the key got removed - remove it from our state
        return keys.filter((k) => k !== key)
      } else {
        // we dont need to change anything
        return keys
      }
    })
  }, mmkv)

  return keys
}
