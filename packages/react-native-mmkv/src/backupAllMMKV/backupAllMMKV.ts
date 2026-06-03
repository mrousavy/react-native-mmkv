import { getMMKVFactory } from '../getMMKVFactory'
import { isTest } from '../isTest'
import type { BackupAllMMKVOptions } from '../specs/MMKVFactory.nitro'

export function backupAllMMKV(options: BackupAllMMKVOptions): number {
  if (isTest()) {
    return 0
  }

  const factory = getMMKVFactory()
  return factory.backupAllMMKV(options)
}
