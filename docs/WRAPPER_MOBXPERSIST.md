# mobx-persist wrapper

If you want to use MMKV with [mobx-persist](https://github.com/pinqy520/mobx-persist), create the following `hydrate` function:

```ts
import { create } from "mobx-persist"
import { MMKV } from "react-native-mmkv"

const storage = new MMKV()

const mmkvStorage = {
  clear: () => {
    storage.clearAll()
    return Promise.resolve()
  },
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

const hydrate = create({
  storage: mmkvStorage,
  jsonify: true,
})

```

You can see a full working example [here](https://github.com/riamon-v/rn-mmkv-with-mobxpersist)
