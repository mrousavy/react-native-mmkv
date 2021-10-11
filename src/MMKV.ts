import { unstable_batchedUpdates } from 'react-native';

interface Listener {
  remove: () => void;
}

/**
 * Used for configuration of a single MMKV instance.
 */
export interface MMKVConfiguration {
  /**
   * The MMKV instance's ID. If you want to use multiple instances, make sure to use different IDs!
   *
   * @example
   * ```ts
   * const userStorage = new MMKV({ id: `user-${userId}-storage` })
   * const globalStorage = new MMKV({ id: 'global-app-storage' })
   * ```
   *
   * @default 'mmkv.default'
   */
  id: string;
  /**
   * The MMKV instance's root path. By default, MMKV stores file inside `$(Documents)/mmkv/`. You can customize MMKV's root directory on MMKV initialization:
   *
   * @example
   * ```ts
   * const temporaryStorage = new MMKV({ path: '/tmp/' })
   * ```
   */
  path?: string;
  /**
   * The MMKV instance's encryption/decryption key. By default, MMKV stores all key-values in plain text on file, relying on iOS's sandbox to make sure the file is encrypted. Should you worry about information leaking, you can choose to encrypt MMKV.
   *
   * @example
   * ```ts
   * const secureStorage = new MMKV({ encryptionKey: 'my-encryption-key!' })
   * ```
   */
  encryptionKey?: string;
}

/**
 * Represents a single MMKV instance.
 */
export interface MMKVInterface {
  /**
   * Set a value for the given `key`.
   */
  set: (key: string, value: boolean | string | number) => void;
  /**
   * Get a boolean value for the given `key`.
   *
   * @default false
   */
  getBoolean: (key: string) => boolean;
  /**
   * Get a string value for the given `key`.
   *
   * @default undefined
   */
  getString: (key: string) => string | undefined;
  /**
   * Get a number value for the given `key`.
   *
   * @default 0
   */
  getNumber: (key: string) => number;
  /**
   * Checks whether the given `key` is being stored in this MMKV instance.
   */
  contains: (key: string) => boolean;
  /**
   * Delete the given `key`.
   */
  delete: (key: string) => void;
  /**
   * Get all keys.
   *
   * @default []
   */
  getAllKeys: () => string[];
  /**
   * Delete all keys.
   */
  clearAll: () => void;
  /**
   * Adds a value changed listener.
   */
  addOnValueChangedListener: (
    onValueChanged: (key: string) => void
  ) => Listener;
}

// global func declaration for JSI functions
declare global {
  function mmkvCreateNewInstance(
    configuration: MMKVConfiguration
  ): MMKVInterface;
}

const onValueChangedListeners = new Map<string, ((key: string) => void)[]>();

/**
 * A single MMKV instance.
 */
export class MMKV implements MMKVInterface {
  private nativeInstance: MMKVInterface;
  private functionCache: Partial<MMKVInterface>;
  private id: string;

  /**
   * Creates a new MMKV instance with the given Configuration.
   * If no custom `id` is supplied, `'default'` will be used.
   */
  constructor(configuration: MMKVConfiguration = { id: 'mmkv.default' }) {
    if (global.mmkvCreateNewInstance == null) {
      throw new Error(
        'Failed to create a new MMKV instance, the native initializer function does not exist. Is the native MMKV library correctly installed? Make sure to disable any remote debugger (e.g. Chrome) to use JSI!'
      );
    }
    this.id = configuration.id;
    this.nativeInstance = global.mmkvCreateNewInstance(configuration);
    this.functionCache = {};
  }

  private get onValueChangedListeners(): ((key: string) => void)[] {
    if (!onValueChangedListeners.has(this.id)) {
      onValueChangedListeners.set(this.id, []);
    }
    return onValueChangedListeners.get(this.id)!;
  }

  private getFunctionFromCache<T extends keyof MMKVInterface>(
    functionName: T
  ): MMKVInterface[T] {
    if (this.functionCache[functionName] == null) {
      this.functionCache[functionName] = this.nativeInstance[functionName];
    }
    return this.functionCache[functionName] as MMKVInterface[T];
  }

  private onValuesAboutToChange(keys: string[]) {
    if (this.onValueChangedListeners.length === 0) return;

    setImmediate(() => {
      unstable_batchedUpdates(() => {
        for (const key of keys) {
          for (const listener of this.onValueChangedListeners) {
            listener(key);
          }
        }
      });
    });
  }

  set(key: string, value: boolean | string | number): void {
    this.onValuesAboutToChange([key]);

    const func = this.getFunctionFromCache('set');
    return func(key, value);
  }
  getBoolean(key: string): boolean {
    const func = this.getFunctionFromCache('getBoolean');
    return func(key);
  }
  getString(key: string): string | undefined {
    const func = this.getFunctionFromCache('getString');
    return func(key);
  }
  getNumber(key: string): number {
    const func = this.getFunctionFromCache('getNumber');
    return func(key);
  }
  contains(key: string): boolean {
    const func = this.getFunctionFromCache('contains');
    return func(key);
  }
  delete(key: string): void {
    this.onValuesAboutToChange([key]);

    const func = this.getFunctionFromCache('delete');
    return func(key);
  }
  getAllKeys(): string[] {
    const func = this.getFunctionFromCache('getAllKeys');
    return func();
  }
  clearAll(): void {
    const keys = this.getAllKeys();
    this.onValuesAboutToChange(keys);

    const func = this.getFunctionFromCache('clearAll');
    return func();
  }

  addOnValueChangedListener(onValueChanged: (key: string) => void): Listener {
    this.onValueChangedListeners.push(onValueChanged);

    return {
      remove: () => {
        const index = this.onValueChangedListeners.indexOf(onValueChanged);
        if (index !== -1) {
          this.onValueChangedListeners.splice(index, 1);
        }
      },
    };
  }
}
