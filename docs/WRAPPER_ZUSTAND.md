# zustand-persist-storage wrapper


If you want to use MMKV with [zustand](https://github.com/pmndrs/zustand), create the following `storage` object. [Check out how to implement it](https://github.com/pmndrs/zustand/wiki/Persisting-the-store's-data#Options) 

Create a new file, like mmkvStorage.ts

```ts
import { MMKV } from 'react-native-mmkv';

export interface ZustandStorage {
    getItem: (name: string) => string | null | Promise<string | null>
    setItem: (name: string, value: string) => void | Promise<void>
    removeItem: (name: string) => void | Promise<void>
}

const storage = new MMKV();

export const mmkvStorage: ZustandStorage = {
    setItem: (key, value) => storage.set(key, value),
    getItem: (key) => storage.getString(key) || null,
    removeItem: (key) => storage.delete(key)
}
```

And this could be your zustand storage with persist:

```ts
import create from "zustand"
import { persist } from "zustand/middleware"
import { mmkvStorage } from './mmkvStorage';

export const useStore = create(persist(
  (set, get) => ({
    fishes: 0,
    addAFish: () => set({ fishes: get().fishes + 1 })
  }),
  {
    name: "app-storage", // unique name
    getStorage: () => mmkvStorage, // <-- this
  }
))
```

And this could be your zustand without persist:

```ts
import create from "zustand"
import { mmkvStorage } from './mmkvStorage';

export const useStore = create(
  (set, get) => ({
    fishes: 0,
    addAFish: () => set({ fishes: get().fishes + 1 })
  }),
  {
    name: "app-storage", // unique name
    getStorage: () => mmkvStorage, // <-- this
  }
)
```
