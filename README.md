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
* **Encryption** support (secure storage)
* **Multiple instances** support (separate user-data with global data)
* **Customize storage location**
* **High performance** because everything is **written in C++** (even the JS functions have C++ bodies!)
* **~30x faster than AsyncStorage**
* Uses [**JSI**](https://github.com/react-native-community/discussions-and-proposals/issues/91) instead of the "old" Bridge

> Fun fact: since all the JS functions have C++ implementations, you can also directly call them in [reanimated](https://github.com/software-mansion/react-native-reanimated) worklets, [Vision Camera](http://github.com/mrousavy/react-native-vision-camera) frame processors or [custom threads using react-native-multithreading](https://github.com/mrousavy/react-native-multithreading).

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

### Create a new instance

To create a new instance of the MMKV storage, use the `MMKV` constructor.

#### Default

```js
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()
```

This creates a new storage instance using the default MMKV storage ID (`mmkv.default`).

#### Customize

```js
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV({
  id: `user-${userId}-storage`,
  path: USER_DIRECTORY + '/storage',
  encryptionKey: 'some-encryption-key'
})
```

This creates a new storage instance using a custom MMKV storage ID. By using a custom storage ID, your storage is separated from the default MMKV storage of your app.

The following values can be configured:

* `id`: The MMKV instance's ID. If you want to use multiple instances, use different IDs. For example, you can separte the global app's storage and a logged-in user's storage. (default: `'mmkv.default'`)
* `path`: The MMKV instance's root path. By default, MMKV stores file inside `$(Documents)/mmkv/`. You can customize MMKV's root directory on MMKV initialization
* `encryptionKey`: The MMKV instance's encryption/decryption key. By default, MMKV stores all key-values in plain text on file, relying on iOS's/Android's sandbox to make sure the file is encrypted. Should you worry about information leaking, you can choose to encrypt MMKV.

### Set

```js
storage.set('user.name', 'Marc')
storage.set('user.age', 20)
storage.set('is-mmkv-fast-asf', true)
```

### Get

```js
const username = storage.getString('user.name') // 'Marc'
const age = storage.getNumber('user.age') // 20
const isMmkvFastAsf = storage.getBoolean('is-mmkv-fast-asf') // true
```

### Delete

```js
storage.delete('user.name')
```

### Get all keys

```js
const keys = storage.getAllKeys() // ['user.name', 'user.age', 'is-mmkv-fast-asf']
```

### Objects

```js
const user = {
  username: 'Marc',
  age: 20
}

storage.set('user', JSON.stringify(user))

const jsonUser = storage.getString('user') // { 'username': 'Marc', 'age': 20 }
const userObject = JSON.parse(jsonUser)
```

### Delete all keys

```js
storage.deleteAllKeys()
```

## Migrate from AsyncStorage

See [#52](https://github.com/mrousavy/react-native-mmkv/issues/52) for instructions on how to safely migrate your existing AsyncStorage database to MMKV.

## Limitations

As the library uses JSI for synchronous native methods access, remote debugging (e.g. with Chrome) is no longer possible. Instead, you should use [Flipper](https://fbflipper.com).

## redux-persist

If you want to use MMKV with [redux-persist](https://github.com/rt2zz/redux-persist), create the following `storage` object:

```ts
import { Storage } from 'redux-persist';

// Unfortunately redux-persist expects Promises,
// so we have to wrap our sync calls with Promise resolvers/rejecters
export const reduxStorage: Storage = {
  setItem: (key, value) => {
    storage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key) => {
    const value = storage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key) => {
    storage.delete(key);
    return Promise.resolve();
  },
};
```

## mobx-persist-store

If you want to use MMKV with [mobx-persist-store](https://github.com/quarrant/mobx-persist-store), create the following `storage` object:

```ts
import { configurePersistable } from 'mobx-persist-store';

configurePersistable({
  storage: {
    setItem: (key, data) => storage.set(key, data),
    getItem: (key) => storage.getString(key),
    removeItem: (key) => storage.delete(key),
  },
});
```

For more information, check out [kanzitelli/rnn-starter](https://github.com/kanzitelli/rnn-starter).

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
