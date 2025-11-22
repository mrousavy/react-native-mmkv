# react-query wrapper

If you want to use MMKV with [react-query](https://tanstack.com/query/latest/docs/framework/react/overview), follow further steps:

1. Install `react-query` persist packages

```sh
yarn add @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
```

2. Add next code into your app

```ts
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { createMMKV } from "react-native-mmkv"

const storage = createMMKV();

const clientStorage = {
  setItem: (key, value) => {
    storage.set(key, value);
  },
  getItem: (key) => {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem: (key) => {
    storage.remove(key);
  },
};

export const clientPersister = createAsyncStoragePersister({ storage: clientStorage });
```

3. Use created `clientPersister` in your root component (eg. `App.tsx`)

```tsx
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

const App = () => {
  return (
    <PersistQueryClientProvider persistOptions={{ persister: clientPersister }}>
      {...}
    </PersistQueryClientProvider>
  );
};
```

For more information check their official [docs](https://tanstack.com/query/latest/docs/framework/react/plugins/createAsyncStoragePersister)
