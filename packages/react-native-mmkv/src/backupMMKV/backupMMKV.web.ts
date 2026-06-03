import type { BackupMMKVOptions } from '../specs/MMKVFactory.nitro'

export function backupMMKV(_options: BackupMMKVOptions): boolean {
  throw new Error("MMKV: 'backupMMKV(..)' is not supported on Web!")
}
