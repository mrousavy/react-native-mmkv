import { getMMKVFactory } from '../getMMKVFactory'
import { isTest } from '../isTest'

export function deleteMMKV(id: string): boolean {
  if (isTest()) {
    return true
  }

  const factory = getMMKVFactory()
  return factory.deleteMMKV(id)
}
