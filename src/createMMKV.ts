import type { Configuration } from './MMKV';
import { MMKVTurboModule } from './NativeMmkv';
import type { NativeMMKV } from './Types';

export const createMMKV = (config: Configuration): NativeMMKV => {
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
