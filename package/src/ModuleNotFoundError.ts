import { NativeModules, Platform } from 'react-native';

declare global {
  // A react-native internal from TurboModuleRegistry.js
  var __turboModuleProxy: unknown | undefined;
}

const BULLET_POINT = '\n* ';

export class ModuleNotFoundError extends Error {
  constructor(cause?: unknown) {
    // TurboModule not found, something went wrong!
    if (global.__turboModuleProxy == null) {
      // TurboModules are not available/new arch is not enabled.
      // react-native-mmkv 3.x.x requires new arch (react-native >0.74)
      // react-native-mmkv 2.x.x works on old arch (react-native <0.74)
      throw new Error(
        'Failed to create a new MMKV instance: react-native-mmkv 3.x.x requires TurboModules, but the new architecture is not enabled!' +
          BULLET_POINT +
          'Downgrade to react-native-mmkv 2.x.x if you want to stay on the old architecture.' +
          BULLET_POINT +
          'Enable the new architecture in your app to use react-native-mmkv 3.x.x. (See https://github.com/reactwg/react-native-new-architecture/blob/main/docs/enable-apps.md)'
      );
    }

    const message =
      'Failed to create a new MMKV instance: The native MMKV Module could not be found.';
    const suggestions: string[] = [];
    suggestions.push(
      'Make sure react-native-mmkv is correctly autolinked (run `npx react-native config` to verify)'
    );
    suggestions.push(
      'Make sure you enabled the new architecture (TurboModules) and CodeGen properly generated the react-native-mmkv specs. See https://github.com/reactwg/react-native-new-architecture/blob/main/docs/enable-apps.md'
    );
    suggestions.push(
      'Make sure you are using react-native 0.74.0 or higher, because react-native-mmkv is a C++ TurboModule.'
    );
    suggestions.push('Make sure you rebuilt the app.');
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
    // check if Expo
    const ExpoConstants =
      NativeModules.NativeUnimoduleProxy?.modulesConstants?.ExponentConstants;
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

    const error = message + BULLET_POINT + suggestions.join(BULLET_POINT);
    super(error, { cause: cause });
  }
}
