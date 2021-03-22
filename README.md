<div align="center">
  <h1 align="center">MMKV</h1>
</div>

<div align="center">
  <a align="center" href='https://ko-fi.com/F1F8CLXG' target='_blank'>
    <img height='36' style='border:0px;height:36px;' src='https://az743702.vo.msecnd.net/cdn/kofi2.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com' />
  </a>
  <br/>
  <a align="center" href="https://github.com/mrousavy?tab=followers">
    <img src="https://img.shields.io/github/followers/mrousavy?label=Follow%20%40mrousavy&style=social" />
  </a>
  <br/>
  <a align="center" href="https://twitter.com/mrousavy">
    <img src="https://img.shields.io/twitter/follow/mrousavy?label=Follow%20%40mrousavy&style=social" />
  </a>
</div>
<br/>

**MMKV** is an efficient, small mobile key-value storage framework developed by WeChat.

> See [Tencent/MMKV](https://github.com/Tencent/MMKV) for more information

**react-native-mmkv** is a library that allows you to use **MMKV** inside your React Native applications.

## Features

* **Get** and **set** strings, booleans and numbers
* **Fully synchronous** calls, no async/await, no Promises, no Bridge.
* **High performance** because everything is **written in C++** (even the JS functions have C++ bodies!)
* **~30x faster than AsyncStorage**
* Uses [**JSI**](https://github.com/react-native-community/discussions-and-proposals/issues/91) instead of the "old" Bridge

> Fun fact: since all the JS functions have C++ implementations, you can also directly call them in [reanimated](https://github.com/software-mansion/react-native-reanimated) worklets, [Vision Camera](http://github.com/cuvent/react-native-vision-camera) frame processors or [custom threads using react-native-multithreading](https://github.com/mrousavy/react-native-multithreading).

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
```

### iOS

iOS installation is automatic, just run:

```sh
cd ios && pod install
```

### Android

To correctly initialize MMKV on Android, please follow the [Installation guide](./INSTALL.md).

## Usage

### Set

```js
import { MMKV } from 'react-native-mmkv';

MMKV.set('user.name', 'Marc')
MMKV.set('user.age', 20)
MMKV.set('is-mmkv-fast-asf', true)
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

MMKV.set('user', JSON.stringify(user))

const jsonUser = MMKV.getString('user') // { 'username': 'Marc', 'age': 20 }
const userObject = JSON.parse(jsonUser)
```

## Limitations

As the library uses JSI for synchronous native methods access, remote debugging (e.g. with Chrome) is no longer possible. Instead, you should use [Flipper](https://fbflipper.com).

## redux-persist

If you want to use MMKV with [redux-persist](https://github.com/rt2zz/redux-persist), create the following `storage` object:

```ts
import { MMKV } from "react-native-mmkv";
import { Storage } from "redux-persist";

// Unfortunately redux-persist expects Promises,
// so we have to wrap our sync calls with Promise resolvers/rejecters
export const storage: Storage = {
  setItem: (key: string, value: string): Promise<boolean> => {
    MMKV.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: string): Promise<string> => {
    const value = MMKV.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key: string): Promise<void> => {
    MMKV.delete(key);
    return Promise.resolve();
  },
};
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
