# jotai wrapper

If you want to use MMKV with [Jotai](https://github.com/pmndrs/jotai), create the following `atomWithMMKV` function:

```ts
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

function getItem(key: string): string | null {
  const value = storage.getString(key)
  return value ? value : null
}

function setItem(key: string, value: string): void {
  storage.set(key, value)
}

function removeItem(key: string): void {
  storage.delete(key);
}

function clearAll(): void {
  storage.clearAll();
}

export const atomWithMMKV = <T>(key: string, initialValue: T) =>
  atomWithStorage<T>(
    key,
    initialValue,
    createJSONStorage<T>(() => ({
      getItem,
      setItem,
      removeItem,
      clearAll,
    })),
  );
```

Then simply use `atomWithMMKV(..)` instead of `atom(..)` when creating an atom you'd like to persist accross app starts. 

```ts
const myAtom = atomWithMMKV('my-atom-key', 'value');
```

*Note:* `createJSONStorage` handles `JSON.stringify()`/`JSON.parse()` when setting and returning the stored value.

See the official Jotai doc here: https://jotai.org/docs/utils/atom-with-storage
