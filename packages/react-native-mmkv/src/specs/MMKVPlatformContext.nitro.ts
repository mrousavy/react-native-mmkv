import type { HybridObject } from 'react-native-nitro-modules'

export interface MMKVPlatformContext
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Get the MMKV base directory
   */
  getBaseDirectory(): string
  /**
   * Get the MMKV AppGroup's directory.
   * @platform iOS
   */
  getAppGroupDirectory(): string
}
