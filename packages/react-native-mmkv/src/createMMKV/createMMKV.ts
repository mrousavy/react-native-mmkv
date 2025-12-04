import type { MMKV } from '../specs/MMKV.nitro'
import type { Configuration } from '../specs/MMKVFactory.nitro'
import { Platform } from 'react-native'
import { addMemoryWarningListener } from '../addMemoryWarningListener/addMemoryWarningListener'
import { isTest } from '../isTest'
import { createMockMMKV } from './createMockMMKV'
import { getMMKVFactory, getPlatformContext } from '../getMMKVFactory'

export function createMMKV(configuration?: Configuration): MMKV {
  if (isTest()) {
    // In a test environment, we mock the MMKV instance.
    return createMockMMKV(configuration)
  }

  const factory = getMMKVFactory()

  // Pre-parse the config
  let config = configuration ?? { id: factory.defaultMMKVInstanceId }

  if (Platform.OS === 'ios') {
    if (config.path == null) {
      // If the user set an App Group directory in Info.plist, let's use
      // the App Group as a MMKV path:
      const platformContext = getPlatformContext()
      const appGroupDirectory = platformContext.getAppGroupDirectory()
      if (appGroupDirectory != null) {
        config.path = appGroupDirectory
      }
    }
  }

  // Creates the C++ MMKV HybridObject
  const mmkv = factory.createMMKV(config)
  // Add a hook that trims the storage when we get a memory warning
  addMemoryWarningListener(mmkv)
  return mmkv
}
