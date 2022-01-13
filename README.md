<div align="center">
  <h1 align="center">MMKV</h1>
  <h3 align="center">The fastest key/value storage for React Native.</h3>
</div>

<div align="center">
  <a align="center" href="https://github.com/mrousavy?tab=followers">
    <img src="https://img.shields.io/github/followers/mrousavy?label=Follow%20%40mrousavy&style=social" />
  </a>
  <br/>
  <a align="center" href="https://twitter.com/mrousavy">
    <img src="https://img.shields.io/twitter/follow/mrousavy?label=Follow%20%40mrousavy&style=social" />
  </a>
  <br />
  <a href="https://github.com/sponsors/mrousavy">
    <img align="right" width="160" alt="This library helped you? Consider sponsoring!" src=".github/funding-octocat.svg">
  </a>
</div>
<br/>


* **MMKV** is an efficient, small mobile key-value storage framework developed by WeChat. See [Tencent/MMKV](https://github.com/Tencent/MMKV) for more information
* **react-native-mmkv** is a library that allows you to easily use **MMKV** inside your React Native applications. It provides fast and direct bindings to the native C++ library which are accessible through a simple JS API.

## Features

* **Get** and **set** strings, booleans and numbers
* **Fully synchronous** calls, no async/await, no Promises, no Bridge.
* **Encryption** support (secure storage)
* **Multiple instances** support (separate user-data with global data)
* **Customize storage location**
* **High performance** because everything is **written in C++** (even the JS functions have C++ bodies!)
* **~30x faster than AsyncStorage**
* Uses [**JSI**](https://github.com/react-native-community/discussions-and-proposals/issues/91) instead of the "old" Bridge
* **iOS**, **Android** and **Web** support

## Sponsors

<div align="right">
  <a href="https://getstream.io/chat/react-native-chat/tutorial/?utm_source=Github&utm_medium=Github_Repo_Content_Ad&utm_content=Developer&utm_campaign=Github_Jan2022_ReactNative&utm_term=react-native-mmkv">
    <img align="right" src="https://theme.zdassets.com/theme_assets/9442057/efc3820e436f9150bc8cf34267fff4df052a1f9c.png" height="40" />
  </a>
</div>

react-native-mmkv is sponsored by **getstream.io**. <br/>
[Try the React Native Chat tutorial 💬](https://getstream.io/chat/react-native-chat/tutorial/?utm_source=Github&utm_medium=Github_Repo_Content_Ad&utm_content=Developer&utm_campaign=Github_Jan2022_ReactNative&utm_term=react-native-mmkv)

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

### Expo

See this comment for more information: [mrousavy/react-native-mmkv#157 (comment)](https://github.com/mrousavy/react-native-mmkv/issues/157#issuecomment-960647481).

## Usage

### Create a new instance

To create a new instance of the MMKV storage, use the `MMKV` constructor. It is recommended that you re-use this instance throughout your entire app instead of creating a new instance each time, so `export` the `storage` object.

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
  path: `${USER_DIRECTORY}/storage`,
  encryptionKey: 'some-encryption-key'
})
```

This creates a new storage instance using a custom MMKV storage ID. By using a custom storage ID, your storage is separated from the default MMKV storage of your app.

The following values can be configured:

* `id`: The MMKV instance's ID. If you want to use multiple instances, use different IDs. For example, you can separte the global app's storage and a logged-in user's storage. (default: `'mmkv.default'`)
* `path`: The MMKV instance's root path. By default, MMKV stores file inside `$(Documents)/mmkv/`. You can customize MMKV's root directory on MMKV initialization (documentation: [iOS](https://github.com/Tencent/MMKV/wiki/iOS_advance#customize-location) / [Android](https://github.com/Tencent/MMKV/wiki/android_advance#customize-location))
* `encryptionKey`: The MMKV instance's encryption/decryption key. By default, MMKV stores all key-values in plain text on file, relying on iOS's/Android's sandbox to make sure the file is encrypted. Should you worry about information leaking, you can choose to encrypt MMKV. (documentation: [iOS](https://github.com/Tencent/MMKV/wiki/iOS_advance#encryption) / [Android](https://github.com/Tencent/MMKV/wiki/android_advance#encryption))

### Set

```js
storage.set('user.name', 'Marc')
storage.set('user.age', 21)
storage.set('is-mmkv-fast-asf', true)
```

### Get

```js
const username = storage.getString('user.name') // 'Marc'
const age = storage.getNumber('user.age') // 21
const isMmkvFastAsf = storage.getBoolean('is-mmkv-fast-asf') // true
```

### Keys

```js
// checking if a specific key exists
const hasUsername = storage.contains('user.name')

// getting all keys
const keys = storage.getAllKeys() // ['user.name', 'user.age', 'is-mmkv-fast-asf']

// delete a specific key + value
storage.delete('user.name')

// delete all keys
storage.clearAll()
```

### Objects

```js
const user = {
  username: 'Marc',
  age: 21
}

// Serialize the object into a JSON string
storage.set('user', JSON.stringify(user))

// Deserialize the JSON string into an object
const jsonUser = storage.getString('user') // { 'username': 'Marc', 'age': 21 }
const userObject = JSON.parse(jsonUser)
```

## Documentation

* [Hooks](./docs/HOOKS.md)
* [Value-change Listeners](./docs/LISTENERS.md)
* [Migrate from AsyncStorage](./docs/MIGRATE_FROM_ASYNC_STORAGE.md)
* [Using MMKV with redux-persis](./docs/WRAPPER_REDUX.md)
* [Using MMKV with mobx-persist-storage](./docs/WRAPPER_MOBX.md)
* [Using MMKV with mobx-persist](./docs/WRAPPER_MOBXPERSIST.md)

## Limitations

As the library uses JSI for synchronous native methods access, remote debugging (e.g. with Chrome) is no longer possible. Instead, you should use [Flipper](https://fbflipper.com).

## Adopting at scale

react-native-mmkv is provided _as is_, I work on it in my free time.

If you're integrating react-native-mmkv in a production app, consider [funding this project](https://github.com/sponsors/mrousavy) and <a href="mailto:me@mrousavy.com?subject=Adopting react-native-mmkv at scale">contact me</a> to receive premium enterprise support, help with issues, prioritize bugfixes, request features, help at integrating react-native-mmkv, and more.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
