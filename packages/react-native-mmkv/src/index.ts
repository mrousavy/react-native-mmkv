import { NitroModules } from 'react-native-nitro-modules'
import { type MMKVFactory, type Configuration } from './specs/MMKVFactory.nitro'
import type { MMKV } from './specs/MMKV.nitro'

let factory: MMKVFactory | undefined

export { type MMKV, type Configuration }

export function createMMKV(): MMKV
export function createMMKV(configuration: Configuration): MMKV
export function createMMKV(configuration?: Configuration): MMKV {
  if (factory == null) {
    factory = NitroModules.createHybridObject<MMKVFactory>('MMKVFactory')
  }

  return factory.createMMKV(configuration ?? { id: 'mmkv.default' })
}
