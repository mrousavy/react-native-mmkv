import { useRef } from 'react'
import type { MMKV } from '../specs/MMKV.nitro'
import type { Configuration } from '../specs/MMKVFactory.nitro'
import { getDefaultMMKVInstance } from '../createMMKV/getDefaultMMKVInstance'
import { createMMKV } from '../createMMKV/createMMKV'

function isConfigurationEqual(
  left?: Configuration,
  right?: Configuration
): boolean {
  if (left == null || right == null) return left == null && right == null

  return (
    left.encryptionKey === right.encryptionKey &&
    left.id === right.id &&
    left.path === right.path &&
    left.mode === right.mode
  )
}

/**
 * Use the default, shared MMKV instance.
 */
export function useMMKV(): MMKV
/**
 * Use a custom MMKV instance with the given configuration.
 * @param configuration The configuration to initialize the MMKV instance with. Does not have to be memoized.
 */
export function useMMKV(configuration: Configuration): MMKV
export function useMMKV(configuration?: Configuration): MMKV {
  const instance = useRef<MMKV>(undefined)
  const lastConfiguration = useRef<Configuration>(undefined)

  if (configuration == null) return getDefaultMMKVInstance()

  if (
    instance.current == null ||
    !isConfigurationEqual(lastConfiguration.current, configuration)
  ) {
    lastConfiguration.current = configuration
    instance.current = createMMKV(configuration)
  }

  return instance.current
}
