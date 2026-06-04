import { AppState } from 'react-native'
import type { AppStateStatus, NativeEventSubscription } from 'react-native'
import type { MMKV } from '../specs/MMKV.nitro'

const registeredInstances = new WeakSet<MMKV>()

export function addContentChangedListener(mmkv: MMKV): void {
  if (registeredInstances.has(mmkv)) {
    return
  }
  registeredInstances.add(mmkv)

  if (global.WeakRef != null && global.FinalizationRegistry != null) {
    const weakMmkv = new WeakRef(mmkv)
    const listener = AppState.addEventListener(
      'change',
      (state: AppStateStatus) => {
        if (state === 'active') {
          weakMmkv.deref()?.checkContentChanged()
        }
      }
    )
    const finalization = new FinalizationRegistry(
      (l: NativeEventSubscription) => {
        l.remove()
      }
    )
    finalization.register(mmkv, listener)
  } else {
    AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        mmkv.checkContentChanged()
      }
    })
  }
}
