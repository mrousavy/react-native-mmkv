# jotai wrapper

If you want to use MMKV with [Jotai](https://github.com/pmndrs/jotai), create the following `atomWithMMKV` function:

```ts
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? JSON.parse(value) : null;
}

function setItem<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
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

See the official Jotai doc here: https://jotai.org/docs/utils/atom-with-storage
