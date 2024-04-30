# redux-persist storage wrapper

If you want to use MMKV with [redux-persist](https://github.com/rt2zz/redux-persist), create the following `storage` object:

```ts
import { Storage } from 'redux-persist'
import { MMKV } from "react-native-mmkv"

const storage = new MMKV()

export const reduxStorage: Storage = {
  setItem: (key, value) => {
    storage.set(key, value)
    return Promise.resolve(true)
  },
  getItem: (key) => {
    const value = storage.getString(key)
    return Promise.resolve(value)
  },
  removeItem: (key) => {
    storage.delete(key)
    return Promise.resolve()
  },
}
```
