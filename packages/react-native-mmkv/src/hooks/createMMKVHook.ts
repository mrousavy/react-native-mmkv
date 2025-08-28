import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDefaultMMKVInstance } from '../createMMKV/getDefaultMMKVInstance'
import type { MMKV } from '../specs/MMKV.nitro'

export function createMMKVHook<
  T extends (boolean | number | string | ArrayBufferLike) | undefined,
  TSet extends T | undefined,
  TSetAction extends TSet | ((current: T) => TSet),
>(getter: (instance: MMKV, key: string) => T) {
  return (
    key: string,
    instance?: MMKV
  ): [value: T, setValue: (value: TSetAction) => void] => {
    const mmkv = instance ?? getDefaultMMKVInstance()

    const [bump, setBump] = useState(0)
    const value = useMemo(() => {
      // bump is here as an additional outside dependency, so this useMemo
      // re-computes the value each time bump changes, effectively acting as a hint
      // that the outside value (storage) has changed. setting bump refreshes this value.
      bump
      return getter(mmkv, key)
    }, [mmkv, key, bump])

    // update value by user set
    const set = useCallback(
      (v: TSetAction) => {
        const newValue = typeof v === 'function' ? v(getter(mmkv, key)) : v
        switch (typeof newValue) {
          case 'number':
          case 'string':
          case 'boolean':
            mmkv.set(key, newValue)
            break
          case 'undefined':
            mmkv.remove(key)
            break
          case 'object':
            if (newValue instanceof ArrayBuffer) {
              mmkv.set(key, newValue)
              break
            } else {
              throw new Error(
                `MMKV: Type object (${newValue}) is not supported!`
              )
            }
          default:
            throw new Error(`MMKV: Type ${typeof newValue} is not supported!`)
        }
      },
      [key, mmkv]
    )

    // update value if it changes somewhere else (second hook, same key)
    useEffect(() => {
      const listener = mmkv.addOnValueChangedListener((changedKey) => {
        if (changedKey === key) {
          setBump((b) => b + 1)
        }
      })
      return () => listener.remove()
    }, [key, mmkv])

    return [value, set]
  }
}
