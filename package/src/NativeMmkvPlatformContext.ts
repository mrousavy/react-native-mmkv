import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import { ModuleNotFoundError } from './ModuleNotFoundError';

export interface Spec extends TurboModule {
  /**
   * Gets the base directory of the documents storage
   */
  getBaseDirectory(): string;
}

let module: Spec | null;

export function getMMKVPlatformContextTurboModule(): Spec {
  try {
    if (module == null) {
      // 1. Get the TurboModule
      module = TurboModuleRegistry.getEnforcing<Spec>('MmkvPlatformContext');
    }
    return module;
  } catch (e) {
    // TurboModule could not be found!
    throw new ModuleNotFoundError(e);
  }
}
