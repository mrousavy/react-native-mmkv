import type { MMKVConfiguration, NativeMMKV } from './MMKV';
import { MMKVTurboModule } from './NativeMmkv';

export const createMMKV = (config: MMKVConfiguration): NativeMMKV => {
  const instance = MMKVTurboModule.createMMKV(config);
  if (__DEV__) {
    if (typeof instance !== 'object' || instance == null) {
      throw new Error(
        'Failed to create MMKV instance - an unknown object was returned by createMMKV(..)!'
      );
    }
  }
  return instance as NativeMMKV;
};
