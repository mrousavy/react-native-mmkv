# react-query wrapper

If you want to use MMKV with [react-query](https://tanstack.com/query/v4/docs/plugins/createSyncStoragePersister), create the following `clientPersister` object:

```ts
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { MMKV } from "react-native-mmkv"

const storage = new MMKV();

export const clientStorage = {
  setItem: (key, value) => {
    storage.set(key, value);
  },
  getItem: (key) => {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem: (key) => {
    storage.delete(key);
  },
};

const clientPersister = createSyncStoragePersister({ storage: clientPersistStorage });
```