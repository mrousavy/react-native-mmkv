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
  /**
   * If `true`, the MMKV instance can only read from the storage, but not write to it.
   * This is more efficient if you do not need to write to it.
   * @default false
   */
  readOnly?: boolean;
}

/**
 * Represents the data types that can be stored in MMKV.
 * This includes primitive types (boolean, string, number) and binary data (ArrayBuffer, ArrayBufferLike).
 *
 * @example
 * ```ts
 * // These types can be directly stored in MMKV
 * mmkv.set('isEnabled', true); // boolean
 * mmkv.set('username', 'user123'); // string
 * mmkv.set('age', 25); // number
 * mmkv.set('data', new ArrayBuffer(8)); // binary data
 * ```
 */
export type SupportedTypes =
  | boolean
  | string
  | number
  | ArrayBuffer
  | ArrayBufferLike;

/**
 * Represents the default storage type for MMKV.
 * This is a record with string keys and values of any type.
 *
 * @example
 * ```ts
 * const mmkv = new MMKV();
 * mmkv.set('key', 'value'); // string
 * const value = mmkv.getString('key'); // string
 * ```
 */
export type DefaultStorage = Record<string, SupportedTypes>;

/**
 * Represents the type of keys that can be used to access values in the MMKV storage.
 * This is a mapped type that extracts keys from a given type `T` where the values are of a specific type `ValueType`.
 */
export type KeysOfType<T, ValueType> = string extends keyof T
  ? string
  : { [P in keyof T]: T[P] extends ValueType ? P : never }[keyof T];

/**
 * Represents a single MMKV instance.
 */
export interface NativeMMKV<TStorage = DefaultStorage> {
  /**
   * Set a value for the given `key`.
   *
   * @throws an Error if the value cannot be set.
   */
  set: <TKey extends keyof TStorage>(key: TKey, value: TStorage[TKey]) => void;
  /**
   * Get the boolean value for the given `key`, or `undefined` if it does not exist.
   *
   * @default undefined
   */
  getBoolean: <K extends KeysOfType<TStorage, boolean>>(
    key: K
  ) => boolean | undefined;
  /**
   * Get the string value for the given `key`, or `undefined` if it does not exist.
   *
   * @default undefined
   */
  getString: <K extends KeysOfType<TStorage, string>>(
    key: K
  ) => string | undefined;
  /**
   * Get the number value for the given `key`, or `undefined` if it does not exist.
   *
   * @default undefined
   */
  getNumber: <K extends KeysOfType<TStorage, number>>(
    key: K
  ) => number | undefined;
  /**
   * Get a raw buffer of unsigned 8-bit (0-255) data.
   *
   * @default undefined
   */
  getBuffer: <K extends KeysOfType<TStorage, ArrayBufferLike>>(
    key: K
  ) => ArrayBufferLike | undefined;
  /**
   * Checks whether the given `key` is being stored in this MMKV instance.
   */
  contains: (key: keyof TStorage) => boolean;
  /**
   * Delete the given `key`.
   */
  delete: (key: keyof TStorage) => void;
  /**
   * Get all keys.
   *
   * @default []
   */
  getAllKeys: () => (keyof TStorage)[];
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

export interface MMKVInterface<TStorage = DefaultStorage>
  extends NativeMMKV<TStorage> {
  /**
   * Adds a value changed listener. The Listener will be called whenever any value
   * in this storage instance changes (set or delete).
   *
   * To unsubscribe from value changes, call `remove()` on the Listener.
   */
  addOnValueChangedListener: (
    onValueChanged: (key: keyof TStorage) => void
  ) => Listener;
}
