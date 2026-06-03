import { getMMKVFactory } from '../getMMKVFactory'
import { isTest } from '../isTest'
import type { RestoreMMKVOptions } from '../specs/MMKVFactory.nitro'

export function restoreMMKV(options: RestoreMMKVOptions): boolean {
  if (isTest()) {
    return true
  }

  const factory = getMMKVFactory()
  return factory.restoreMMKV(options)
}
