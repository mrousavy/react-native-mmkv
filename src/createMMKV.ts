import type { MMKVConfiguration, NativeMMKV } from 'react-native-mmkv';

// global func declaration for JSI functions
declare global {
  function mmkvCreateNewInstance(configuration: MMKVConfiguration): NativeMMKV;
}

export const createMMKV = (config: MMKVConfiguration): NativeMMKV => {
  if (global.mmkvCreateNewInstance == null) {
    throw new Error(
      'Failed to create a new MMKV instance, the native initializer function does not exist. Is the native MMKV library correctly installed? Make sure to disable any remote debugger (e.g. Chrome) to use JSI!'
    );
  }

  return global.mmkvCreateNewInstance(config);
};
