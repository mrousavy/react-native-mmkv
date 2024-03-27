import { TurboModule, TurboModuleRegistry } from 'react-native';
import { getLazyTurboModule } from './LazyTurboModule';

export interface Spec extends TurboModule {
  /**
   * Gets the base directory of the documents storage
   */
  getBaseDirectory(): string;
}

export const PlatformContext = getLazyTurboModule(() =>
  TurboModuleRegistry.get<Spec>('MmkvPlatformContext')
);
