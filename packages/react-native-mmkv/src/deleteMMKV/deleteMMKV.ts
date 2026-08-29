import { getMMKVFactory } from '../getMMKVFactory'
import { isTest } from '../isTest'

export function deleteMMKV(id: string, path?: string): boolean {
  if (isTest()) {
    return true
  }

  const factory = getMMKVFactory()
  return factory.deleteMMKV(id, path)
}
