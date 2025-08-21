import { NitroModules } from 'react-native-nitro-modules'
import { type MMKVFactory, type Configuration } from './specs/MMKVFactory.nitro'
import type { MMKV } from './specs/MMKV.nitro'
import type { MMKVPlatformContext } from './specs/MMKVPlatformContext.nitro'

let factory: MMKVFactory | undefined
let platformContext: MMKVPlatformContext | undefined
let defaultId: string | undefined

export { type MMKV, type Configuration }

export function createMMKV(): MMKV
export function createMMKV(configuration: Configuration): MMKV
export function createMMKV(configuration?: Configuration): MMKV {
  if (factory == null) {
    // Load the factory HybridObject
    factory = NitroModules.createHybridObject<MMKVFactory>('MMKVFactory')
  }
  if (defaultId == null) {
    // Get the default MMKV instance ID - typically 'mmkv.default'
    defaultId = factory.defaultMMKVInstanceId
  }

  // Pre-parse the config
  let config = configuration ?? { id: defaultId }
  if (config.path == null) {
    // `path` is not overridden by the user, so we choose the default documents directory.
    if (platformContext == null) {
      platformContext = NitroModules.createHybridObject<MMKVPlatformContext>(
        'MMKVPlatformContext'
      )
    }
    // Gets the documents/cache directory on the underlying platform.
    config.path = platformContext.getBaseDirectory()
  }

  // Creates the C++ MMKV HybridObject
  return factory.createMMKV(config)
}
