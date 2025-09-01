import type { HybridObject } from 'react-native-nitro-modules'

export interface MMKVPlatformContext
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Get the MMKV base directory
   */
  getBaseDirectory(): string
  /**
   * Get the MMKV AppGroup's directory.
   * The AppGroup can be set in your App's `Info.plist`, and will enable
   * data sharing between main app, companions (e.g. watch app) and extensions.
   * @platform iOS
   * @default undefined
   */
  getAppGroupDirectory(): string | undefined
}
