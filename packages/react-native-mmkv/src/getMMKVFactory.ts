import { NitroModules } from 'react-native-nitro-modules'
import type { MMKVFactory } from './specs/MMKVFactory.nitro'
import type { MMKVPlatformContext } from './specs/MMKVPlatformContext.nitro'

let factory: MMKVFactory | undefined
let platformContext: MMKVPlatformContext | undefined

export function getPlatformContext(): MMKVPlatformContext {
  if (platformContext == null) {
    // Lazy-init the platform-context HybridObject
    platformContext = NitroModules.createHybridObject<MMKVPlatformContext>(
      'MMKVPlatformContext'
    )
  }
  return platformContext
}

export function getMMKVFactory(): MMKVFactory {
  if (factory == null) {
    // Lazy-init the factory HybridObject
    factory = NitroModules.createHybridObject<MMKVFactory>('MMKVFactory')
    const context = getPlatformContext()
    const baseDirectory = context.getBaseDirectory()
    factory.initializeMMKV(baseDirectory)
  }

  return factory
}
