import { AppState } from 'react-native'
import type { AppStateStatus, NativeEventSubscription } from 'react-native'
import type { MMKV } from '../specs/MMKV.nitro'

export function addMemoryWarningListener(mmkv: MMKV): void {
  const checkExternalContentChanged = (
    appState: AppStateStatus,
    instance: MMKV
  ) => {
    if (appState === 'active') {
      instance.checkExternalContentChanged()
    }
  }

  if (global.WeakRef != null && global.FinalizationRegistry != null) {
    // 1. Weakify MMKV so we can safely use it inside the memoryWarning event listener
    const weakMmkv = new WeakRef(mmkv)
    const memoryWarningListener = AppState.addEventListener(
      'memoryWarning',
      () => {
        // 0. Everytime we receive a memoryWarning, we try to trim the MMKV instance (if it is still valid)
        weakMmkv.deref()?.trim()
      }
    )
    const appStateListener = AppState.addEventListener('change', (appState) => {
      const instance = weakMmkv.deref()
      if (instance != null) {
        checkExternalContentChanged(appState, instance)
      }
    })
    // 2. Add a listener to when the MMKV instance is deleted
    const finalization = new FinalizationRegistry(
      (listeners: NativeEventSubscription[]) => {
        // 3. When MMKV is deleted, this listener will be called with the AppState listeners.
        listeners.forEach((l) => l.remove())
      }
    )
    // 2.1. Bind the listener to the actual MMKV instance.
    finalization.register(mmkv, [memoryWarningListener, appStateListener])
  } else {
    // WeakRef/FinalizationRegistry is not implemented in this engine.
    // Just add the listener, even if it retains MMKV strong forever.
    AppState.addEventListener('memoryWarning', () => {
      mmkv.trim()
    })
    AppState.addEventListener('change', (appState) => {
      checkExternalContentChanged(appState, mmkv)
    })
  }
}
