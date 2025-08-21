import { createMMKVHook } from './createMMKVHook'

/**
 * Use the buffer value (unsigned 8-bit (0-255)) of the given `key` from the given MMKV storage instance.
 *
 * If no instance is provided, a shared default instance will be used.
 *
 * @example
 * ```ts
 * const [privateKey, setPrivateKey] = useMMKVBuffer("user.privateKey")
 * ```
 */
export const useMMKVBuffer = createMMKVHook((instance, key) =>
  instance.getBuffer(key)
)
