import type { RestoreAllMMKVOptions } from '../specs/MMKVFactory.nitro'

export function restoreAllMMKV(_options: RestoreAllMMKVOptions): number {
  throw new Error("MMKV: 'restoreAllMMKV(..)' is not supported on Web!")
}
