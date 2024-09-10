import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import { ModuleNotFoundError } from './ModuleNotFoundError';

export interface Spec extends TurboModule {
  /**
   * Gets the base directory of the documents storage
   */
  getBaseDirectory(): string;
  /**
   * Get the App Group directory if it exists, or `undefined` otherwise.
   *
   * The App Group directory will be used instead of a custom path to use the same
   * MMKV instance between the iOS app, Widgets, and other companion apps.
   *
   * To set an App Group, add a `AppGroup` field to `Info.plist`
   *
   * @platform ios
   */
  getAppGroupDirectory(): string | undefined;
}

let mmkvPlatformModule: Spec | null;

export function getMMKVPlatformContextTurboModule(): Spec {
  try {
    if (mmkvPlatformModule == null) {
      // 1. Get the TurboModule
      mmkvPlatformModule = TurboModuleRegistry.getEnforcing<Spec>(
        'MmkvPlatformContext'
      );
    }
    return mmkvPlatformModule;
  } catch (e) {
    // TurboModule could not be found!
    throw new ModuleNotFoundError(e);
  }
}
