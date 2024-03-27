import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Gets the base directory of the documents storage
   */
  getBaseDirectory(): string;
}

export const PlatformContext = TurboModuleRegistry.getEnforcing<Spec>(
  'MmkvPlatformContext'
);
