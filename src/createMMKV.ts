import { NativeModules } from 'react-native';
import type { MMKVConfiguration, NativeMMKV } from 'react-native-mmkv';

// global func declaration for JSI functions
declare global {
  function mmkvCreateNewInstance(configuration: MMKVConfiguration): NativeMMKV;
}

// Root directory of all MMKV stores
const ROOT_DIRECTORY: string | null = null;

export const createMMKV = (config: MMKVConfiguration): NativeMMKV => {
  // Check if the constructor exists. If not, try installing the JSI bindings.
  if (global.mmkvCreateNewInstance == null) {
    // get the MMKV ReactModule
    const MMKVModule = NativeModules.MMKV;
    if (MMKVModule == null || typeof MMKVModule.install !== 'function')
      throw new Error(
        'The native MMKV Module could not be found! Is it correctly installed and autolinked?'
      );
    // Call the synchronous blocking install() function
    const result = MMKVModule.install(ROOT_DIRECTORY);
    if (result !== true)
      throw new Error(
        `The native MMKV Module could not be installed! Looks like something went wrong when installing JSI bindings: ${result}`
      );
    // Check again if the constructor now exists. If not, throw an error.
    if (global.mmkvCreateNewInstance == null)
      throw new Error(
        'Failed to create a new MMKV instance, the native initializer function does not exist. Is the native MMKV library correctly installed? Make sure to disable any remote debugger (e.g. Chrome) to use JSI!'
      );
  }

  return global.mmkvCreateNewInstance(config);
};
