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
export function useMMKVKeys(instance?: MMKV): string[] {
  const mmkv = instance ?? getDefaultMMKVInstance()
  const [allKeys, setKeys] = useState<string[]>(() => mmkv.getAllKeys())

  useMMKVListener((key) => {
    // a key changed
    setKeys((keys) => {
      const currentlyHasKey = keys.includes(key)
      const hasKey = mmkv.contains(key)
      if (hasKey !== currentlyHasKey) {
        // Re-fetch the keys from native
        return mmkv.getAllKeys()
      } else {
        // We are up-to-date.
        return keys
      }
    })
  }, mmkv)

  return allKeys
}
