
# zustand persist-middleware wrapper

If you want to use MMKV with [zustand persist-middleware](https://github.com/pmndrs/zustand#persist-middleware), create the following `storage` object:

```ts
import { StateStorage } from 'zustand/middleware'
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()

const zustandStorage: StateStorage = {
  setItem: (name, value) => {
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