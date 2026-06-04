import type { MMKV } from '../specs/MMKV.nitro'

export function addContentChangedAppStateListener(
  _mmkv: MMKV,
  _onContentChanged: () => void
): { remove(): void } {
  return {
    remove: () => {
      // no-op
    },
  }
}
