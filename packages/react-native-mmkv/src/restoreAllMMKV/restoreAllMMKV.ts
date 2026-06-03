import { getMMKVFactory } from '../getMMKVFactory'
import { isTest } from '../isTest'
import type { RestoreAllMMKVOptions } from '../specs/MMKVFactory.nitro'

export function restoreAllMMKV(options: RestoreAllMMKVOptions): number {
  if (isTest()) {
    return 0
  }

  const factory = getMMKVFactory()
  return factory.restoreAllMMKV(options)
}
