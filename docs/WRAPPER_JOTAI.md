# jotai wrapper

If you want to use MMKV with [Jotai](https://github.com/pmndrs/jotai), create the following `atomWithStorage` function:

```ts
import { atomWithStorage as jotaiAtomWithStorage, createJSONStorage } from 'jotai/utils';
import { MMKV } from 'react-native-mmkv';

const mmkvStorage = new MMKV();

function getItem<T>(key: string): T | null {
  const value = mmkvStorage.getString(key);
  return value ? JSON.parse(value) : null;
}

function setItem<T>(key: string, value: T): void {
  mmkvStorage.set(key, JSON.stringify(value));
}

function removeItem(key: string): void {
  mmkvStorage.delete(key);
}

function clearAll(): void {
  mmkvStorage.clearAll();
}

export const atomWithStorage = <T>(key: string, initialValue: T) =>
  jotaiAtomWithStorage<T>(
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

Then simply use this `atomWithStorage` when creating an atom you'd like to persist accross app starts.

```ts
const myAtom = atomWithStorage('my-atom-key', 'value');
```

See the official Jotai doc here: https://jotai.org/docs/utils/atom-with-storage
