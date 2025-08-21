import type { HybridObject } from 'react-native-nitro-modules'

export interface MMKVPlatformContext
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Get the MMKV base directory
   */
  readonly baseDirectory: string
  /**
   * Get the MMKV AppGroup's directory.
   * @platform iOS
   */
  readonly appGroupDirectory: string
}
