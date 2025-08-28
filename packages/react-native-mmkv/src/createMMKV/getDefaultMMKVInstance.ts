import type { MMKV } from '../specs/MMKV.nitro'
import { createMMKV } from './createMMKV'

let defaultInstance: MMKV | null = null
export function getDefaultMMKVInstance(): MMKV {
  if (defaultInstance == null) {
    defaultInstance = createMMKV()
  }
  return defaultInstance
}
