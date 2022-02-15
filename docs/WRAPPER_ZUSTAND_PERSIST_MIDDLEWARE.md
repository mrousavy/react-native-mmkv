
# zustand persist-middleware wrapper

If you want to use MMKV with [zustand persist-middleware](https://github.com/pmndrs/zustand#persist-middleware), create the following `storage` object:

```ts
import { MMKV } from 'react-native-mmkv'
import { StateStorage } from 'zustand/middleware'

const storage = new MMKV()

const zustandStorage: StateStorage = {
  setItem: async (name, value) => {
    storage.set(name, value)
    return Promise.resolve()
  },
  getItem: (name) => {
    const value = storage.getString(name)
    if (value) {
      return Promise.resolve(value)
    } else {
      return null
    }
  },
  removeItem: (name) => {
    storage.delete(name)
    return Promise.resolve()
  },
}
```