# react-query wrapper

If you want to use MMKV with [react-query](https://tanstack.com/query/v4/docs/plugins/persistQueryClient), follow further steps:

1. Install `react-query` persist packages

```sh
yarn add @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client
```

2. Add next code into your app

```ts
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { MMKV } from "react-native-mmkv"

const storage = new MMKV();

const clientStorage = {
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

export const clientPersister = createSyncStoragePersister({ storage: clientStorage });
```

3. Use created `clientPersister` in your root component (eg. `App.tsx`)

```ts
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

const App = () => {
  return (
    <PersistQueryClientProvider persistOptions={{ persister: clientPersister }}>
      {...}
    </PersistQueryClientProvider>
  );
};
```

For more information check their official [docs](https://tanstack.com/query/v4/docs/plugins/persistQueryClient#persistqueryclientprovider)
