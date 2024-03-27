import { TurboModule, TurboModuleRegistry } from 'react-native';
import { getLazyTurboModule } from './LazyTurboModule';

export interface Spec extends TurboModule {
  /**
   * Gets the base directory of the documents storage
   */
  getBaseDirectory(): string;
}

function getModule(): Spec | null {
  return TurboModuleRegistry.get<Spec>('MmkvPlatformContext');
}
export const PlatformContext = getLazyTurboModule(getModule);
