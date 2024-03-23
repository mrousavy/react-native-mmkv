const Mmkv = require('./NativeMmkv').default;

export function multiply(a: number, b: number): number {
  return Mmkv.multiply(a, b);
}
