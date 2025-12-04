import { getMMKVFactory } from '../getMMKVFactory'
import { isTest } from '../isTest'

export function existsMMKV(id: string): boolean {
  if (isTest()) {
    return true
  }

  const factory = getMMKVFactory()
  return factory.existsMMKV(id)
}
