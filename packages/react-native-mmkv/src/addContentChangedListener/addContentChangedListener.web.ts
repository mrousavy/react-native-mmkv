import type { MMKV } from '../specs/MMKV.nitro'

export function addContentChangedListener(_mmkv: MMKV): void {
  // no-op on Web
}
