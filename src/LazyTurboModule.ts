import { NativeModules, Platform, TurboModule } from 'react-native';

/**
 * Lazily get a TurboModule by wrapping it in a Proxy.
 */
export function getLazyTurboModule<T extends TurboModule>(
  initializeTurboModule: () => T | undefined
): T {
  const proxy = new Proxy<T>(undefined, {
    get: (target, property) => {
      if (target == null) {
        // Target is null, let's initialize it!
        target = initializeTurboModule();

        if (target == null) {
          // if it still is null, something went wrong!
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

      return target[property];
    },
  });
  return proxy;
}
