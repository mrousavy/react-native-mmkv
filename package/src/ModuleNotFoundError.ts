import { NativeModules, Platform } from 'react-native';

declare global {
  // A react-native internal from TurboModuleRegistry.js
  var __turboModuleProxy: unknown | undefined;
}

const BULLET_POINT = '\n* ';

function messageWithSuggestions(
  message: string,
  suggestions: string[]
): string {
  return message + BULLET_POINT + suggestions.join(BULLET_POINT);
}

function getFrameworkType(): 'react-native' | 'expo' | 'expo-go' {
  // check if Expo
  const ExpoConstants =
    NativeModules.NativeUnimoduleProxy?.modulesConstants?.ExponentConstants;
  if (ExpoConstants != null) {
    if (ExpoConstants.appOwnership === 'expo') {
      // We're running Expo Go
      return 'expo-go';
    } else {
      // We're running Expo bare / standalone
      return 'expo';
    }
  }
  return 'react-native';
}

export class ModuleNotFoundError extends Error {
  constructor(cause?: unknown) {
    // TurboModule not found, something went wrong!
    if (global.__turboModuleProxy == null) {
      // TurboModules are not available/new arch is not enabled.
      // react-native-mmkv 3.x.x requires new arch (react-native >0.74)
      // react-native-mmkv 2.x.x works on old arch (react-native <0.74)
      const message =
        'Failed to create a new MMKV instance: react-native-mmkv 3.x.x requires TurboModules, but the new architecture is not enabled!';
      const suggestions: string[] = [];
      suggestions.push(
        'Downgrade to react-native-mmkv 2.x.x if you want to stay on the old architecture.'
      );
      suggestions.push(
        'Enable the new architecture in your app to use react-native-mmkv 3.x.x. (See https://github.com/reactwg/react-native-new-architecture/blob/main/docs/enable-apps.md)'
      );
      const error = messageWithSuggestions(message, suggestions);
      super(error, { cause: cause });
      return;
    }

    const framework = getFrameworkType();
    if (framework === 'expo-go') {
      super(
        'react-native-mmkv is not supported in Expo Go! Use EAS (`expo prebuild`) or eject to a bare workflow instead.'
      );
      return;
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
    if (framework === 'expo') {
      suggestions.push('Make sure you ran `expo prebuild`.');
    }
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

    const error = messageWithSuggestions(message, suggestions);
    super(error, { cause: cause });
  }
}
