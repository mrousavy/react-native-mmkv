import type { MMKV } from './MMKV';

export const DELETE_SYMBOL = Symbol();
export const NOT_YET_LOADED_SYMBOL = Symbol();

type ValueType = string | boolean | number | Uint8Array;
type NOT_YET_LOADED = typeof NOT_YET_LOADED_SYMBOL;
type WILL_DELETE = typeof DELETE_SYMBOL;

export type MemoryCacheMap = Map<
  string,
  ValueType | NOT_YET_LOADED | WILL_DELETE
>;

export class MemoryCache {
  map: MemoryCacheMap;
  private mmkv: MMKV;

  constructor(mmkv: MMKV) {
    this.map = new Map();
    this.mmkv = mmkv;

    // init all keys, values are not yet loaded though.
    for (const key of mmkv.getAllKeys()) {
      this.map.set(key, NOT_YET_LOADED_SYMBOL);
    }
  }

  has(key: string): boolean {
    const value = this.map.get(key);
    if (value == null) return false;
    if (value === DELETE_SYMBOL) return false;
    return true;
  }

  getAllKeys(): string[] {
    const keys: string[] = [];
    this.map.forEach((value, key) => {
      if (value !== DELETE_SYMBOL) keys.push(key);
    });
    return keys;
  }

  private get<T extends 'getBoolean' | 'getString' | 'getNumber' | 'getBuffer'>(
    key: string,
    method: T
  ): ValueType | undefined {
    const value = this.map.get(key);

    if (value === NOT_YET_LOADED_SYMBOL) {
      const nativeValue = this.mmkv[method](key);
      if (nativeValue != null) {
        this.map.set(key, nativeValue);
        return nativeValue;
      } else {
        return undefined;
      }
    }
    if (value === DELETE_SYMBOL) {
      return undefined;
    }

    return value;
  }

  getBoolean(key: string): boolean | undefined {
    const value = this.get(key, 'getBoolean');
    if (typeof value === 'boolean') return value;
    else return undefined;
  }

  getString(key: string): string | undefined {
    const value = this.get(key, 'getString');
    if (typeof value === 'string') return value;
    else return undefined;
  }

  getNumber(key: string): number | undefined {
    const value = this.get(key, 'getNumber');
    if (typeof value === 'number') return value;
    else return undefined;
  }

  getBuffer(key: string): Uint8Array | undefined {
    const value = this.get(key, 'getBuffer');
    if (value instanceof Uint8Array) return value;
    else return undefined;
  }

  set(key: string, value: ValueType): void {
    this.map.set(key, value);
  }

  delete(key: string): void {
    this.map.set(key, DELETE_SYMBOL);
  }

  clear(): void {
    for (const key of this.map.keys()) {
      this.delete(key);
    }
  }
}
