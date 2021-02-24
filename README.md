<div align="center">
  <h1>MMKV</h1>
</div>

**MMKV** is an efficient, small mobile key-value storage framework developed by WeChat.

> See [Tencent/MMKV](https://github.com/Tencent/MMKV) for more information

## Features

* **Get** and **set** strings, booleans and numbers
* **Synchronous** calls, no async/await, no Promises.
* **High performance** because everything is **written in C++** (even the JS functions have C++ bodies!)
* **~30x faster than AsyncStorage**
* [**JSI**](https://github.com/react-native-community/discussions-and-proposals/issues/91)
* **No bridge traffic**

> Fun fact: since all the JS functions have C++ implementations, you can also directly call them in [reanimated](https://github.com/software-mansion/react-native-reanimated) worklets

## Benchmark

<div align="center">
  <img src="./img/benchmark_1000_get.png" />
  <p>
    <b>AsyncStorage vs MMKV</b>: Reading a value from Storage 1000 times. <br/>
    Measured in milliseconds on an iPhone 8, lower is better.
  </p>
</div>

## Installation

```sh
npm install react-native-mmkv
cd ios && pod install
```

## Usage

### Set

```js
import { MMKV } from 'react-native-mmkv';

MMKV.set('Marc', 'user.name')
MMKV.set(20, 'user.age')
MMKV.set(true, 'is-mmkv-fast-asf')
```

### Get

```js
import { MMKV } from 'react-native-mmkv';

const username = MMKV.getString('user.name') // 'Marc'
const age = MMKV.getNumber('user.age') // 20
const isMmkvFastAsf = MMKV.getBoolean('is-mmkv-fast-asf') // true
```

### Delete

```js
import { MMKV } from 'react-native-mmkv';

MMKV.delete('user.name')
```

### Get all keys

```js
import { MMKV } from 'react-native-mmkv';

const keys = MMKV.getAllKeys() // ['user.name', 'user.age', 'is-mmkv-fast-asf']
```

### Objects

```js
import { MMKV } from 'react-native-mmkv';

const user = {
  username: 'Marc',
  age: 20
}

MMKV.set(JSON.stringify(user), 'user')

const jsonUser = MMKV.getString('user') // { 'username': 'Marc', 'age': 20 }
const userObject = JSON.parse(jsonUser)
```

## redux-persist

If you want to use MMKV with redux-persist, create the following `storage` object:

```ts
import { MMKV } from "react-native-mmkv";
import { Storage } from "redux-persist";

type StorageType = typeof MMKV & {
  /**
   * Redux Persist plugin for react-native-mmkv
   */
  redux: Storage;
};

// Unfortunately redux-persist expects Promises, so we have to wrap our sync calls with Promise resolvers/rejecters
const storage: StorageType = {
  redux: {
    setItem: (key: string, value: string): Promise<boolean> => {
      MMKV.set(value, key);
      return Promise.resolve(true);
    },
    getItem: (key: string): Promise<string> =>
      Promise.resolve(MMKV.getString(key)),
    removeItem: (key: string): Promise<void> => {
      MMKV.delete(key);
      return Promise.resolve();
    },
  },
  ...MMKV,
};

export default storage;
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
