import type { HybridObject } from 'react-native-nitro-modules'
import type { EncryptionType } from './MMKVFactory.nitro'

export interface Listener {
  remove: () => void
}

export interface MMKV extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
  /**
   * Get the ID of this {@linkcode MMKV} instance.
   */
  readonly id: string
  /**
   * Get the current total size of the storage, in bytes.
   */
  readonly size: number
  /**
   * Returns whether this instance is in read-only mode or not.
   * If this is `true`, you can only use "get"-functions.
   */
  readonly isReadOnly: boolean
  /**
   * Set a {@linkcode value} for the given {@linkcode key}.
   *
   * @throws an Error if the {@linkcode key} is empty.
   * @throws an Error if the {@linkcode value} cannot be set.
   */
  set(key: string, value: boolean | string | number | ArrayBuffer): void
  /**
   * Get the boolean value for the given `key`, or `undefined` if it does not exist.
   *
   * @default undefined
   */
  getBoolean(key: string): boolean | undefined
  /**
   * Get the string value for the given `key`, or `undefined` if it does not exist.
   *
   * @default undefined
   */
  getString(key: string): string | undefined
  /**
   * Get the number value for the given `key`, or `undefined` if it does not exist.
   *
   * @default undefined
   */
  getNumber(key: string): number | undefined
  /**
   * Get a raw buffer of unsigned 8-bit (0-255) data.
   *
   * @default undefined
   */
  getBuffer(key: string): ArrayBuffer | undefined
  /**
   * Checks whether the given `key` is being stored in this MMKV instance.
   */
  contains(key: string): boolean
  /**
   * Removes the given `key`.
   * @returns true if the key was removed, false otherwise
   */
  remove(key: string): boolean
  /**
   * Get all keys.
   *
   * @default []
   */
  getAllKeys(): string[]
  /**
   * Clears all keys/values.
   */
  clearAll(): void
  /**
   * Sets (or updates) the encryption-key to encrypt all data in this MMKV instance with.
   *
   * To remove encryption, pass `undefined` as a key.
   *
   * Encryption keys can have a maximum length of 16 bytes.
   *
   * @throws an Error if the instance cannot be recrypted.
   * @deprecated Use {@linkcode encrypt | encrypt(...)} or {@linkcode decrypt | decrypt()} instead.
   */
  recrypt(key: string | undefined): void
  /**
   * Encrypts the data in this MMKV instance with the
   * given {@linkcode key} and {@linkcode ecnryptionType}.
   *
   * If this MMKV instance is already encrypted ({@linkcode isEncrypted}),
   * it will re-encrypt the data.
   *
   * Future attempts to open this MMKV instance will require the same
   * {@linkcode key} and {@linkcode encryptionType}, otherwise reads
   * will fail.
   *
   * The {@linkcode key} must be 16-bytes in {@linkcode EncryptionType | 'AES-128'}
   * encryption (the default), or 32-bytes in {@linkcode EncryptionType | 'AES-256'}
   * encryption.
   *
   * @param key The encryption key to use. In AES-128 this must be 16-bytes, in AES-256 it must be 32-bytes long.
   * @param encryptionType The encryption type to use. Default: AES-128
   */
  encrypt(key: string, encryptionType?: EncryptionType): void
  /**
   * Decrypts the data in this MMKV instance and removes
   * the encryption key.
   *
   * Future attempts to open this MMKV instance must be done
   * without an encryption key, as it is now plain-text.
   */
  decrypt(): void
  /**
   * Trims the storage space and clears memory cache.
   *
   * Since MMKV does not resize itself after deleting keys, you can call `trim()`
   * after deleting a bunch of keys to manually trim the memory- and
   * disk-file to reduce storage and memory usage.
   *
   * In most applications, this is not needed at all.
   */
  trim(): void
  /**
   * Adds a value changed listener. The Listener will be called whenever any value
   * in this storage instance changes (set or delete).
   *
   * To unsubscribe from value changes, call `remove()` on the Listener.
   */
  addOnValueChangedListener(onValueChanged: (key: string) => void): Listener

  /**
   * Imports all keys and values from the
   * given other {@linkcode MMKV} instance.
   * @returns the number of imported keys/values.
   */
  importAllFrom(other: MMKV): number
}
