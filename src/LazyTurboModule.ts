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
            const message =
              'Failed to create a new MMKV instance: The native MMKV Module could not be found.';
            const suggestions: string[] = [];
            suggestions.push(
              'Make sure react-native-mmkv is correctly autolinked (run `npx react-native config` to verify)'
            );
            switch (Platform.OS) {
              case 'ios':
              case 'macos':
                suggestions.push(
                  'Make sure you ran `pod install` in the ios/ directory.'
                );
                break;
              case 'android':
                suggestions.push('Make sure gradle is synced.');
                break;
              default:
                throw new Error(`MMKV is not supported on ${Platform.OS}!`);
            }
            suggestions.push(
              'Make sure you enabled the new architecture (CodeGen, TurboModules, Bridgeless). See https://github.com/reactwg/react-native-new-architecture/blob/main/docs/enable-apps.md'
            );
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
                suggestions.push('Make sure you ran `expo prebuild`.');
              }
            }

            suggestions.push('Make sure you rebuilt the app.');
            const error = message + '\n* ' + suggestions.join('\n* ');
            throw new Error(error);
          }
        }

        return target.module[property as keyof T];
      },
    }
  );
  return proxy as unknown as T;
}
