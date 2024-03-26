import { NativeModules, Platform, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes';

/**
 * Configures the mode of the MMKV instance.
 */
export enum Mode {
  /**
   * The MMKV instance is only used from a single process (this app).
   */
  SINGLE_PROCESS,
  /**
   * The MMKV instance may be used from multiple processes, such as app clips, share extensions or background services.
   */
  MULTI_PROCESS,
}

/**
 * Used for configuration of a single MMKV instance.
 */
export interface Configuration {
  /**
   * The MMKV instance's ID. If you want to use multiple instances, make sure to use different IDs!
   *
   * @example
   * ```ts
   * const userStorage = new MMKV({ id: `user-${userId}-storage` })
   * const globalStorage = new MMKV({ id: 'global-app-storage' })
   * ```
   *
   * @default 'mmkv.default'
   */
  id: string;
  /**
   * The MMKV instance's root path. By default, MMKV stores file inside `$(Documents)/mmkv/`. You can customize MMKV's root directory on MMKV initialization:

   * @example
   * ```ts
   * const temporaryStorage = new MMKV({ path: '/tmp/' })
   * ```
   *
   * _Notice_: On iOS you can set the AppGroup bundle property to share the same storage between your app and its extensions.
   * In this case `path` property will be ignored.
   * See more on MMKV configuration [here](https://github.com/Tencent/MMKV/wiki/iOS_tutorial#configuration).
   *
   * @default undefined
   */
  path?: string;
  /**
   * The MMKV instance's encryption/decryption key. By default, MMKV stores all key-values in plain text on file, relying on iOS's sandbox to make sure the file is encrypted. Should you worry about information leaking, you can choose to encrypt MMKV.
   *
   * Encryption keys can have a maximum length of 16 bytes.
   *
   * @example
   * ```ts
   * const secureStorage = new MMKV({ encryptionKey: 'my-encryption-key!' })
   * ```
   *
   * @default undefined
   */
  encryptionKey?: string;
  /**
   * Configure the processing mode for MMKV.
   * - `SINGLE_PROCESS`: The MMKV instance is only used from a single process (this app).
   * - `MULTI_PROCESS`: The MMKV instance may be used from multiple processes, such as app clips, share extensions or background services.
   *
   * @default SINGLE_PROCESS
   */
  mode?: Mode;
}

export interface Spec extends TurboModule {
  initialize(basePath: string | undefined): boolean;
  createMMKV(configuration: Configuration): UnsafeObject;
}

let module: Spec | null = null;

/**
 * Get the MMKV TurboModule, and initialize it if this is the first time calling.
 * This will throw an error if the module cannot be found.
 */
export function getMMKVTurboModule(): Spec {
  if (module == null) {
    // try to find the turbomodule
    module = TurboModuleRegistry.get<Spec>('MmkvCxx');

    if (module == null) {
      // if it still is null, something went wrong!
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
  }

  return module;
}
