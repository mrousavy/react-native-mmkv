import { NativeModules, Platform, TurboModule } from 'react-native';

interface ModuleHolder<T> {
  module: T | null;
}

/**
 * Lazily get a TurboModule by wrapping it in a Proxy.
 */
export function getLazyTurboModule<T extends TurboModule>(
  initializeTurboModule: () => T | null
): T {
  const proxy = new Proxy<ModuleHolder<T>>(
    {
      module: null,
    },
    {
      get: (target, property) => {
        if (target.module == null) {
          // Target is null, let's initialize it!
          target.module = initializeTurboModule();

          if (target.module == null) {
            // TurboModule not found, something went wrong!
            let message =
              'Failed to create a new MMKV instance: The native MMKV Module could not be found.';
            message +=
              '\n* Make sure react-native-mmkv is correctly autolinked (run `npx react-native config` to verify)';
            if (Platform.OS === 'ios' || Platform.OS === 'macos') {
              message +=
                '\n* Make sure you ran `pod install` in the ios/ directory.';
            }
            if (Platform.OS === 'android') {
              message += '\n* Make sure gradle is synced.';
            }
            // check if Expo
            const ExpoConstants =
              NativeModules.NativeUnimoduleProxy?.modulesConstants
                ?.ExponentConstants;
            if (ExpoConstants != null) {
              if (ExpoConstants.appOwnership === 'expo') {
                // We're running Expo Go
                throw new Error(
                  'react-native-mmkv is not supported in Expo Go! Use EAS (`expo prebuild`) or eject to a bare workflow instead.'
                );
              } else {
                // We're running Expo bare / standalone
                message += '\n* Make sure you ran `expo prebuild`.';
              }
            }

            message += '\n* Make sure you rebuilt the app.';
            throw new Error(message);
          }
        }

        return target.module[property as keyof T];
      },
    }
  );
  return proxy as unknown as T;
}
