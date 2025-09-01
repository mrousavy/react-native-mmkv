import type { HybridObject } from 'react-native-nitro-modules'
import type { MMKV } from './MMKV.nitro'

/**
 * Configures the mode of the MMKV instance.
 * - `single-process`: The MMKV instance is only used from a single process (this app).
 * - `multi-process`: The MMKV instance may be used from multiple processes, such as app clips, share extensions or background services.
 */
export type Mode = 'single-process' | 'multi-process'

/**
 * Used for configuration of a single MMKV instance.
 */
export interface Configuration {
  /**
   * The MMKV instance's ID. If you want to use multiple instances, make sure to use different IDs!
   *
   * @example
   * ```ts
   * const userStorage = createMMKV({ id: `user-${userId}-storage` })
   * const globalStorage = createMMKV({ id: 'global-app-storage' })
   * ```
   *
   * @default 'mmkv.default'
   */
  id: string
  /**
   * The MMKV instance's root path. By default, MMKV stores file inside `$(Documents)/mmkv/`. You can customize MMKV's root directory on MMKV initialization:

   * @example
   * ```ts
   * const temporaryStorage = createMMKV({ path: '/tmp/' })
   * ```
   *
   * @note On iOS, if an `AppGroup` is set in `Info.plist` and `path` is `undefined`, MMKV will use the `AppGroup` directory.
   * App Groups allow you to share MMKV storage between apps, widgets and extensions within the same AppGroup bundle.
   * For more information, see [the `Configuration` section](https://github.com/Tencent/MMKV/wiki/iOS_tutorial#configuration).
   *
   * @default undefined
   */
  path?: string
  /**
   * The MMKV instance's encryption/decryption key. By default, MMKV stores all key-values in plain text on file, relying on iOS's sandbox to make sure the file is encrypted. Should you worry about information leaking, you can choose to encrypt MMKV.
   *
   * Encryption keys can have a maximum length of 16 bytes.
   *
   * @example
   * ```ts
   * const secureStorage = createMMKV({ encryptionKey: 'my-encryption-key!' })
   * ```
   *
   * @default undefined
   */
  encryptionKey?: string
  /**
   * Configure the processing mode for MMKV.
   *
   * @default 'single-process'
   */
  mode?: Mode
  /**
   * If `true`, the MMKV instance can only read from the storage, but not write to it.
   * This is more efficient if you do not need to write to it.
   * @default false
   */
  readOnly?: boolean
}

export interface MMKVFactory
  extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
  /**
   * Create a new {@linkcode MMKV} instance with the given {@linkcode Configuration}
   */
  createMMKV(configuration: Configuration): MMKV

  /**
   * Initialize the MMKV library with the given root path.
   * This has to be called once, before using {@linkcode createMMKV}.
   */
  initializeMMKV(rootPath: string): void

  /**
   * Get the default MMKV instance's ID.
   * @default 'mmkv.default'
   */
  readonly defaultMMKVInstanceId: string
}
