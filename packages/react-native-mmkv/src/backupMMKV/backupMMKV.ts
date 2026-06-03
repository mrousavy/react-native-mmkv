import { getMMKVFactory } from '../getMMKVFactory'
import { isTest } from '../isTest'
import type { BackupMMKVOptions } from '../specs/MMKVFactory.nitro'

export function backupMMKV(options: BackupMMKVOptions): boolean {
  if (isTest()) {
    return true
  }

  const factory = getMMKVFactory()
  return factory.backupMMKV(options)
}
