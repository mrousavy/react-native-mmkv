import { Platform } from 'react-native';
import { getMMKVTurboModule, type Configuration } from './NativeMmkv';
import type { NativeMMKV } from './Types';
import { getMMKVPlatformContextTurboModule } from './NativeMmkvPlatformContext';

export const createMMKV = (config: Configuration): NativeMMKV => {
  const module = getMMKVTurboModule();

  if (Platform.OS === 'ios') {
    if (config.path == null) {
      // If no `path` was supplied, we check if an `AppGroup` was set in Info.plist
      const appGroupDirectory =
        getMMKVPlatformContextTurboModule().getAppGroupDirectory();
      if (appGroupDirectory != null) {
        // If we have an `AppGroup` in Info.plist, use that as a path.
        config.path = appGroupDirectory;
      }
    }
  }

  const instance = module.createMMKV(config);
  if (__DEV__) {
    if (typeof instance !== 'object' || instance == null) {
      throw new Error(
        'Failed to create MMKV instance - an unknown object was returned by createMMKV(..)!'
      );
    }
  }
  return instance as NativeMMKV;
};
