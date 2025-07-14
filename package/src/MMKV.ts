import { createMMKV } from './createMMKV';
import { createMockMMKV } from './createMMKV.mock';
import { isTest } from './PlatformChecker';
import type {
  Configuration,
  DefaultStorage,
  KeysOfType,
  Listener,
  MMKVInterface,
  NativeMMKV,
} from './Types';
import { addMemoryWarningListener } from './MemoryWarningListener';

const onValueChangedListeners = new Map<string, ((key: string) => void)[]>();

/**
 * A single MMKV instance.
 */
export class MMKV<TStorage extends DefaultStorage = DefaultStorage>
  implements MMKVInterface<TStorage> {
  private nativeInstance: NativeMMKV;
  private functionCache: Partial<NativeMMKV>;
  private id: string;

  /**
   * Creates a new MMKV instance with the given Configuration.
   * If no custom `id` is supplied, `'mmkv.default'` will be used.
   */
  constructor(configuration: Configuration = { id: 'mmkv.default' }) {
    this.id = configuration.id;
    this.nativeInstance = isTest()
      ? createMockMMKV()
      : createMMKV(configuration);
    this.functionCache = {};

    addMemoryWarningListener(this);
  }

  private get onValueChangedListeners() {
    if (!onValueChangedListeners.has(this.id)) {
      onValueChangedListeners.set(this.id, []);
    }
    return onValueChangedListeners.get(this.id)!;
  }

  private getFunctionFromCache<T extends keyof NativeMMKV<TStorage>>(
    functionName: T
  ): NativeMMKV<TStorage>[T] {
    if (this.functionCache[functionName] == null) {
      this.functionCache[functionName] = this.nativeInstance[functionName];
    }
    return this.functionCache[functionName] as unknown as NativeMMKV<TStorage>[T];
  }

  private onValuesChanged(keys: (keyof TStorage)[]) {
    if (this.onValueChangedListeners.length === 0) return;

    for (const key of keys) {
      for (const listener of this.onValueChangedListeners) {
        listener(key as string);
      }
    }
  }

  get size(): number {
    return this.nativeInstance.size;
  }
  get isReadOnly(): boolean {
    return this.nativeInstance.isReadOnly;
  }
  set<TKey extends keyof TStorage, TValue extends TStorage[TKey]>(
    key: TKey,
    value: TValue
  ): void {
    const func = this.getFunctionFromCache('set');
    func(key, value);

    this.onValuesChanged([key]);
  }
  getBoolean(key: KeysOfType<TStorage, boolean>): boolean | undefined {
    const func = this.getFunctionFromCache('getBoolean');
    return func(key);
  }
  getString(key: KeysOfType<TStorage, string>): string | undefined {
    const func = this.getFunctionFromCache('getString');
    return func(key);
  }
  getNumber(key: KeysOfType<TStorage, number>): number | undefined {
    const func = this.getFunctionFromCache('getNumber');
    return func(key);
  }
  getBuffer(
    key: KeysOfType<TStorage, ArrayBufferLike | ArrayBuffer>
  ): ArrayBufferLike | ArrayBuffer | undefined {
    const func = this.getFunctionFromCache('getBuffer');
    return func(key);
  }
  contains(key: keyof TStorage): boolean {
    const func = this.getFunctionFromCache('contains');
    return func(key);
  }
  delete(key: keyof TStorage): void {
    const func = this.getFunctionFromCache('delete');
    func(key);

    this.onValuesChanged([key]);
  }
  getAllKeys(): (keyof TStorage)[] {
    const func = this.getFunctionFromCache('getAllKeys');
    return func();
  }
  clearAll(): void {
    const keys = this.getAllKeys();

    const func = this.getFunctionFromCache('clearAll');
    func();

    this.onValuesChanged(keys);
  }
  recrypt(key: string | undefined): void {
    const func = this.getFunctionFromCache('recrypt');
    return func(key);
  }
  trim(): void {
    const func = this.getFunctionFromCache('trim');
    func();
  }

  toString(): string {
    return `MMKV (${this.id}): [${this.getAllKeys().join(', ')}]`;
  }
  toJSON(): object {
    return {
      [this.id]: this.getAllKeys(),
    };
  }

  addOnValueChangedListener(
    onValueChanged: (key: keyof TStorage) => void
  ): Listener {
    this.onValueChangedListeners.push(onValueChanged as (key: string) => void);

    return {
      remove: () => {
        const index = this.onValueChangedListeners.indexOf(onValueChanged as (key: string) => void);
        if (index !== -1) {
          this.onValueChangedListeners.splice(index, 1);
        }
      },
    };
  }
}
