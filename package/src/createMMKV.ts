import { Platform } from 'react-native';
import { getMMKVTurboModule } from './NativeMmkv';
import { type Configuration, Mode, type NativeMMKV } from './Types';
import { getMMKVPlatformContextTurboModule } from './NativeMmkvPlatformContext';

export const createMMKV = (config: Configuration): NativeMMKV => {
  const module = getMMKVTurboModule();

  if (Platform.OS === 'ios') {
    if (config.path == null) {
      try {
        // If no `path` was supplied, we check if an `AppGroup` was set in Info.plist
        const appGroupDirectory =
          getMMKVPlatformContextTurboModule().getAppGroupDirectory();
        if (appGroupDirectory != null) {
          // If we have an `AppGroup` in Info.plist, use that as a path.
          config.path = appGroupDirectory;
        }
      } catch (e) {
        // We cannot throw errors here because it is a sync C++ TurboModule func. idk why.
        console.error(e);
      }
    }
  }

  if (typeof config.mode === 'number') {
    // Code-gen expects enums to be strings. In TS, they might be numbers tho.
    // This sucks, so we need a workaround.
    // @ts-expect-error the native side actually expects a string.
    config.mode = Mode[config.mode];
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
