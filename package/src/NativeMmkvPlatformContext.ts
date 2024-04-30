import { TurboModule, TurboModuleRegistry } from 'react-native';
import { ModuleNotFoundError } from './ModuleNotFoundError';

export interface Spec extends TurboModule {
  /**
   * Gets the base directory of the documents storage
   */
  getBaseDirectory(): string;
}

let module: Spec | null;
try {
  module = TurboModuleRegistry.getEnforcing<Spec>('MmkvPlatformContext');
} catch (e) {
  // TurboModule could not be found!
  throw new ModuleNotFoundError(e);
}

export const PlatformContext = module;
