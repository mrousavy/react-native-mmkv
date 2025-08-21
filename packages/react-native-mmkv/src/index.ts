import { NitroModules } from 'react-native-nitro-modules'
import { type MMKVFactory, type Configuration } from './specs/MMKVFactory.nitro'
import type { MMKV } from './specs/MMKV.nitro'
import type { MMKVPlatformContext } from './specs/MMKVPlatformContext.nitro'
import { Platform } from 'react-native'

let factory: MMKVFactory | undefined
let platformContext: MMKVPlatformContext | undefined

export { type MMKV, type Configuration }

export function createMMKV(): MMKV
export function createMMKV(configuration: Configuration): MMKV
export function createMMKV(configuration?: Configuration): MMKV {
  if (platformContext == null) {
    // Lazy-init the platform-context HybridObject
    platformContext = NitroModules.createHybridObject<MMKVPlatformContext>(
      'MMKVPlatformContext'
    )
  }
  if (factory == null) {
    // Lazy-init the factory HybridObject
    factory = NitroModules.createHybridObject<MMKVFactory>('MMKVFactory')
    const baseDirectory = platformContext.getBaseDirectory()
    factory.initializeMMKV(baseDirectory)
  }

  // Pre-parse the config
  let config = configuration ?? { id: factory.defaultMMKVInstanceId }

  if (Platform.OS === 'ios') {
    if (config.path == null) {
      // If the user set an App Group directory in Info.plist, let's use
      // the App Group as a MMKV path:
      const appGroupDirectory = platformContext.getAppGroupDirectory()
      if (appGroupDirectory != null) {
        config.path = appGroupDirectory
      }
    }
  }

  // Creates the C++ MMKV HybridObject
  return factory.createMMKV(config)
}
