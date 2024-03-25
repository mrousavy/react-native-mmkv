import { NativeModules, Platform, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes';

export type Config = {
  id: string;
  path?: string;
  encryptionKey?: string;
};

export interface Spec extends TurboModule {
  initialize(basePath: string | undefined): boolean;
  createMMKV(configuration: Config): UnsafeObject;
}

const module = TurboModuleRegistry.get<Spec>('Mmkv');

if (module == null) {
  let message =
    'Failed to create a new MMKV instance: The native MMKV Module could not be found.';
  message +=
    '\n* Make sure react-native-mmkv is correctly autolinked (run `npx react-native config` to verify)';
  if (Platform.OS === 'ios' || Platform.OS === 'macos') {
    message += '\n* Make sure you ran `pod install` in the ios/ directory.';
  }
  if (Platform.OS === 'android') {
    message += '\n* Make sure gradle is synced.';
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
      message += '\n* Make sure you ran `expo prebuild`.';
    }
  }

  message += '\n* Make sure you rebuilt the app.';
  throw new Error(message);
}

// Initialize MMKV
const BASE_PATH: string | undefined = undefined;
module.initialize(BASE_PATH);

export const MMKVTurboModule = module;
