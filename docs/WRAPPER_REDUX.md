# redux-persist storage wrapper

If you want to use MMKV with [redux-persist](https://github.com/rt2zz/redux-persist), create the following `storage` object:

```ts
import { Storage } from 'redux-persist'
import { createMMKV } from "react-native-mmkv"

const storage = createMMKV()

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
    storage.remove(key)
    return Promise.resolve()
  },
}
```
