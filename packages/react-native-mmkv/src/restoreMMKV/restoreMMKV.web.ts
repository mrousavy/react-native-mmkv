import type { RestoreMMKVOptions } from '../specs/MMKVFactory.nitro'

export function restoreMMKV(_options: RestoreMMKVOptions): boolean {
  throw new Error("MMKV: 'restoreMMKV(..)' is not supported on Web!")
}
