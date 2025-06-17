import { createMMKV } from './createMMKV';
import { createMockMMKV } from './createMMKV.mock';
import { isTest } from './PlatformChecker';
import type {
  Configuration,
  Listener,
  MMKVInterface,
  NativeMMKV,
} from './Types';
import { addMemoryWarningListener } from './MemoryWarningListener';

type ListenerType = (key: string) => void;
const onValueChangedListeners = new Map<string, ListenerType[]>();

/**
 * A single MMKV instance.
 */
export class MMKV<K extends string> implements MMKVInterface<K> {
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

  private getFunctionFromCache<T extends keyof NativeMMKV>(
    functionName: T
  ): NativeMMKV[T] {
    if (this.functionCache[functionName] == null) {
      this.functionCache[functionName] = this.nativeInstance[functionName];
    }
    return this.functionCache[functionName] as NativeMMKV[T];
  }

  private onValuesChanged(keys: string[]) {
    if (this.onValueChangedListeners.length === 0) return;

    for (const key of keys) {
      for (const listener of this.onValueChangedListeners) {
        listener(key);
      }
    }
  }

  get size(): number {
    return this.nativeInstance.size;
  }
  get isReadOnly(): boolean {
    return this.nativeInstance.isReadOnly;
  }
  set(key: K, value: boolean | string | number | ArrayBuffer): void {
    const func = this.getFunctionFromCache('set');
    func(key, value);

    this.onValuesChanged([key]);
  }
  getBoolean(key: K): boolean | undefined {
    const func = this.getFunctionFromCache('getBoolean');
    return func(key);
  }
  getString(key: K): string | undefined {
    const func = this.getFunctionFromCache('getString');
    return func(key);
  }
  getNumber(key: K): number | undefined {
    const func = this.getFunctionFromCache('getNumber');
    return func(key);
  }
  getBuffer(key: K): ArrayBufferLike | undefined {
    const func = this.getFunctionFromCache('getBuffer');
    return func(key);
  }
  contains(key: K): boolean {
    const func = this.getFunctionFromCache('contains');
    return func(key);
  }
  delete(key: K): void {
    const func = this.getFunctionFromCache('delete');
    func(key);

    this.onValuesChanged([key]);
  }
  getAllKeys(): string[] {
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

  addOnValueChangedListener(onValueChanged: (key: K) => void): Listener {
    this.onValueChangedListeners.push(onValueChanged as ListenerType);

    return {
      remove: () => {
        const index = this.onValueChangedListeners.indexOf(onValueChanged as ListenerType);
        if (index !== -1) {
          this.onValueChangedListeners.splice(index, 1);
        }
      },
    };
  }
}
