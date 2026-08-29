import { getPlatformContext } from '../getMMKVFactory'

/**
 * Get the default native MMKV base directory.
 */
export function getBaseDirectory(): string {
  const platformContext = getPlatformContext()
  return platformContext.getBaseDirectory()
}
