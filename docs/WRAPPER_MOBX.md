# mobx-persist-store wrapper

If you want to use MMKV with [mobx-persist-store](https://github.com/quarrant/mobx-persist-store), create the following `storage` object:

```ts
import { configurePersistable } from 'mobx-persist-store'
import { MMKV } from "react-native-mmkv"

const storage = new MMKV()

configurePersistable({
  storage: {
    setItem: (key, data) => storage.set(key, data),
    getItem: (key) => storage.getString(key),
    removeItem: (key) => storage.delete(key),
  },
})
```
