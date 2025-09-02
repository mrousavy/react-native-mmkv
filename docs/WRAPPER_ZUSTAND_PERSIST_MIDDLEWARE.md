# zustand persist-middleware wrapper

If you want to use MMKV with [zustand persist-middleware](https://github.com/pmndrs/zustand#persist-middleware), create the following `storage` object:

```ts
import { StateStorage } from 'zustand/middleware'
import { createMMKV } from 'react-native-mmkv'

const storage = createMMKV()

const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value)
  },
  getItem: (name) => {
    const value = storage.getString(name)
    return value ?? null
  },
  removeItem: (name) => {
    return storage.remove(name)
  },
}
```
