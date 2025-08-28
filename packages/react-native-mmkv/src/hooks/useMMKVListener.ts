import { useEffect, useRef } from 'react'
import type { MMKV } from '../specs/MMKV.nitro'
import { getDefaultMMKVInstance } from '../createMMKV/getDefaultMMKVInstance'

/**
 * Listen for changes in the given MMKV storage instance.
 * If no instance is passed, the default instance will be used.
 * @param valueChangedListener The function to call whenever a value inside the storage instance changes
 * @param instance The instance to listen to changes to (or the default instance)
 *
 * @example
 * ```ts
 * useMMKVListener((key) => {
 *   console.log(`Value for "${key}" changed!`)
 * })
 * ```
 */
export function useMMKVListener(
  valueChangedListener: (key: string) => void,
  instance?: MMKV
): void {
  const ref = useRef(valueChangedListener)
  ref.current = valueChangedListener

  const mmkv = instance ?? getDefaultMMKVInstance()

  useEffect(() => {
    const listener = mmkv.addOnValueChangedListener((changedKey) => {
      ref.current(changedKey)
    })
    return () => listener.remove()
  }, [mmkv])
}
