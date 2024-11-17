import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes';
import { ModuleNotFoundError } from './ModuleNotFoundError';
import { getMMKVPlatformContextTurboModule } from './NativeMmkvPlatformContext';

/**
 * IMPORTANT: These types are also in the Types.ts file.
 * Due to how react-native-codegen works these are required here as the spec types can not be separated from spec.
 * We also need the types separate to allow bypassing importing turbo module registry in web
 */
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
   * @note On iOS, if an `AppGroup` is set in `Info.plist` and `path` is `undefined`, MMKV will use the `AppGroup` directory.
   * App Groups allow you to share MMKV storage between apps, widgets and extensions within the same AppGroup bundle.
   * For more information, see [the `Configuration` section](https://github.com/Tencent/MMKV/wiki/iOS_tutorial#configuration).
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
  /**
   * If `true`, the MMKV instance can only read from the storage, but not write to it.
   */
  readOnly?: boolean;
}

export interface Spec extends TurboModule {
  /**
   * Initialize MMKV with the given base storage directory.
   * This should be the documents directory by default.
   */
  initialize(basePath: string): boolean;
  /**
   * Create a new instance of MMKV.
   * The returned {@linkcode UnsafeObject} is a `jsi::HostObject`.
   */
  createMMKV(configuration: Configuration): UnsafeObject;
}

let mmkvModule: Spec | null;

export function getMMKVTurboModule(): Spec {
  try {
    if (mmkvModule == null) {
      // 1. Load MMKV TurboModule
      mmkvModule = TurboModuleRegistry.getEnforcing<Spec>('MmkvCxx');

      // 2. Get the PlatformContext TurboModule as well
      const platformContext = getMMKVPlatformContextTurboModule();

      // 3. Initialize it with the documents directory from platform-specific context
      const basePath = platformContext.getBaseDirectory();
      mmkvModule.initialize(basePath);
    }

    return mmkvModule;
  } catch (cause) {
    // TurboModule could not be found!
    throw new ModuleNotFoundError(cause);
  }
}
