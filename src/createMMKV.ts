import type { MMKVConfiguration, NativeMMKV } from './MMKV';
import { MMKVTurboModule } from './NativeMmkv';

export const createMMKV = (config: MMKVConfiguration): NativeMMKV => {
  return MMKVTurboModule.createMMKV(config);
};
