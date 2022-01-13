# mobx-persist wrapper

If you want to use MMKV with [mobx-persist](https://github.com/pinqy520/mobx-persist), create the following `hydrate` function:

```ts
import { create } from "mobx-persist";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();
const promise = (callback: () => any) =>
  new Promise((resolve, reject) => {
    try {
      const value = callback?.();
      resolve(value);
    } catch (err) {
      reject(err);
    }
  });

const mmkvStorage = {
  clear: () => promise(storage.clearAll),
  setItem: (key: string, value: any) => promise(() => storage.set(key, value)),
  getItem: (key: string) => promise(() => storage.getString(key)),
  removeItem: (key: string) => promise(() => storage.delete(key)),
};

const hydrate = create({
  storage: mmkvStorage,
  jsonify: true,
});

```

You can see a full working example [here](https://github.com/riamon-v/rn-mmkv-with-mobxpersist)