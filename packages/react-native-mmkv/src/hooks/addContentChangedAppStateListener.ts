import { AppState } from 'react-native'
import type { AppStateStatus, NativeEventSubscription } from 'react-native'
import type { MMKV } from '../specs/MMKV.nitro'

export function addContentChangedAppStateListener(
  mmkv: MMKV,
  onContentChanged: () => void
): NativeEventSubscription {
  return AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') {
      mmkv.checkContentChanged()
      onContentChanged()
    }
  })
}
