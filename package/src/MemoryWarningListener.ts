import { AppState } from 'react-native';
import type { NativeEventSubscription } from 'react-native';
import { MMKVInterface } from './Types';

export function addMemoryWarningListener(mmkv: MMKVInterface): void {
  if (global.WeakRef != null && global.FinalizationRegistry != null) {
    // 1. Weakify MMKV so we can safely use it inside the memoryWarning event listener
    const weakMmkv = new WeakRef(mmkv);
    const listener = AppState.addEventListener('memoryWarning', () => {
      // 0. Everytime we receive a memoryWarning, we try to trim the MMKV instance (if it is still valid)
      weakMmkv.deref()?.trim();
    });
    // 2. Add a listener to when the MMKV instance is deleted
    const finalization = new FinalizationRegistry(
      (l: NativeEventSubscription) => {
        // 3. When MMKV is deleted, this listener will be called with the memoryWarning listener.
        l.remove();
      }
    );
    // 2.1. Bind the listener to the actual MMKV instance.
    finalization.register(mmkv, listener);
  } else {
    // WeakRef/FinalizationRegistry is not implemented in this engine.
    // Just add the listener, even if it retains MMKV strong forever.
    AppState.addEventListener('memoryWarning', () => {
      mmkv.trim();
    });
  }
}
