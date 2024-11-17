/**
 * IMPORTANT: Some of these types are also in the NativeMmkv.ts file.
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
}

/**
 * Represents a single MMKV instance.
 */
export interface NativeMMKV {
  /**
   * Set a value for the given `key`.
   *
   * @throws an Error if the value cannot be set.
   */
  set: (key: string, value: boolean | string | number | ArrayBuffer) => void;
  /**
   * Get the boolean value for the given `key`, or `undefined` if it does not exist.
   *
   * @default undefined
   */
  getBoolean: (key: string) => boolean | undefined;
  /**
   * Get the string value for the given `key`, or `undefined` if it does not exist.
   *
   * @default undefined
   */
  getString: (key: string) => string | undefined;
  /**
   * Get the number value for the given `key`, or `undefined` if it does not exist.
   *
   * @default undefined
   */
  getNumber: (key: string) => number | undefined;
  /**
   * Get a raw buffer of unsigned 8-bit (0-255) data.
   *
   * @default undefined
   */
  getBuffer: (key: string) => ArrayBuffer | undefined;
  /**
   * Checks whether the given `key` is being stored in this MMKV instance.
   */
  contains: (key: string) => boolean;
  /**
   * Delete the given `key`.
   */
  delete: (key: string) => void;
  /**
   * Get all keys.
   *
   * @default []
   */
  getAllKeys: () => string[];
  /**
   * Delete all keys.
   */
  clearAll: () => void;
  /**
   * Sets (or updates) the encryption-key to encrypt all data in this MMKV instance with.
   *
   * To remove encryption, pass `undefined` as a key.
   *
   * Encryption keys can have a maximum length of 16 bytes.
   *
   * @throws an Error if the instance cannot be recrypted.
   */
  recrypt: (key: string | undefined) => void;
  /**
   * Trims the storage space and clears memory cache.
   *
   * Since MMKV does not resize itself after deleting keys, you can call `trim()`
   * after deleting a bunch of keys to manually trim the memory- and
   * disk-file to reduce storage and memory usage.
   *
   * In most applications, this is not needed at all.
   */
  trim(): void;
  /**
   * Get the current total size of the storage, in bytes.
   */
  readonly size: number;
  /**
   * Returns whether this instance is in read-only mode or not.
   * If this is `true`, you can only use "get"-functions.
   */
  readonly isReadOnly: boolean;
}

export interface Listener {
  remove: () => void;
}

export interface MMKVInterface extends NativeMMKV {
  /**
   * Adds a value changed listener. The Listener will be called whenever any value
   * in this storage instance changes (set or delete).
   *
   * To unsubscribe from value changes, call `remove()` on the Listener.
   */
  addOnValueChangedListener: (
    onValueChanged: (key: string) => void
  ) => Listener;
}
