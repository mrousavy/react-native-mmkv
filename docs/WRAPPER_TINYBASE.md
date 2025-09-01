#  tinybase wrapper

If you want to use MMKV with [Tinybase](https://github.com/pmndrs/zustand#persist-middleware), follow these steps:

```ts
import { MMKV } from 'react-native-mmkv'
import { createStore } from 'tinybase';
import { createReactNativeMmkvPersister } from 'tinybase/persisters/persister-react-native-mmkv';

const storage = createMMKV()
const store = createStore().setTables({ pets: { fido: { species: 'dog' } } });
const persister = createReactNativeMmkvPersister(store, storage);

await persister.save();
```

Similarly, to set up with the react hook:

```tsx
const storage = createMMKV()

const App = () => {
  useCreatePersister(
    store,
    store => createReactNativeMmkvPersister(store, storage),
    [],
    async persister => {
      // ...
    },
  );
}
```

For more information check their official [docs](https://tinybase.org/api/persister-react-native-mmkv/functions/creation/createreactnativemmkvpersister/)
