import { NitroModules } from 'react-native-nitro-modules'
import { type MMKVFactory, type Configuration } from './specs/MMKVFactory.nitro'
import type { MMKV } from './specs/MMKV.nitro'

const HybridMMKVFactory =
  NitroModules.createHybridObject<MMKVFactory>('MMKVFactory')

export { type MMKV, type Configuration }

export function createMMKV(): MMKV
export function createMMKV(configuration: Configuration): MMKV
export function createMMKV(configuration?: Configuration): MMKV {
  return HybridMMKVFactory.createMMKV(configuration ?? { id: 'mmkv.default' })
}
