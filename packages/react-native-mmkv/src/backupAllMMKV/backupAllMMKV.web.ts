import type { BackupAllMMKVOptions } from '../specs/MMKVFactory.nitro'

export function backupAllMMKV(_options: BackupAllMMKVOptions): number {
  throw new Error("MMKV: 'backupAllMMKV(..)' is not supported on Web!")
}
