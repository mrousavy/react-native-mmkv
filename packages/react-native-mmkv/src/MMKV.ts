import type { Configuration } from './specs/MMKVFactory.nitro'
import type { MMKV as MMKVType, Listener } from './specs/MMKV.nitro'
import type { HybridObject } from 'react-native-nitro-modules'
import { createMMKV } from './createMMKV/createMMKV'

export class MMKV implements MMKVType {
  private nativeInstance: MMKVType

  constructor(config?: Configuration) {
    this.nativeInstance = createMMKV(config)
  }

  toString(): string {
    return this.nativeInstance.toString()
  }

  set(key: string, value: boolean | string | number | ArrayBuffer): void {
    this.nativeInstance.set(key, value)
  }

  getBoolean(key: string): boolean | undefined {
    return this.nativeInstance.getBoolean(key)
  }

  getString(key: string): string | undefined {
    return this.nativeInstance.getString(key)
  }

  getNumber(key: string): number | undefined {
    return this.nativeInstance.getNumber(key)
  }

  getBuffer(key: string): ArrayBuffer | undefined {
    return this.nativeInstance.getBuffer(key)
  }

  contains(key: string): boolean {
    return this.nativeInstance.contains(key)
  }

  remove(key: string): void {
    this.nativeInstance.remove(key)
  }

  getAllKeys(): string[] {
    return this.nativeInstance.getAllKeys()
  }

  clearAll(): void {
    return this.nativeInstance.clearAll()
  }

  recrypt(key: string | undefined): void {
    return this.nativeInstance.recrypt(key)
  }

  trim(): void {
    return this.nativeInstance.trim()
  }

  get size(): number {
    return this.nativeInstance.size
  }

  get isReadOnly(): boolean {
    return this.nativeInstance.isReadOnly
  }

  addOnValueChangedListener(onValueChanged: (key: string) => void): Listener {
    return this.nativeInstance.addOnValueChangedListener(onValueChanged)
  }

  get name(): string {
    return this.nativeInstance.name
  }

  dispose(): void {
    this.nativeInstance.dispose()
  }

  equals(other: HybridObject): boolean {
    return this.nativeInstance.equals(other)
  }
}
