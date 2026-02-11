| **V4 Docs** | [old V3 Docs](./README_V3.md) |
|:---|:---|

<a href="https://margelo.io">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/img/banner-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./docs/img/banner-light.png" />
    <img alt="react-native-mmkv" src="./docs/img/banner-light.png" />
  </picture>
</a>

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
* **react-native-mmkv** is a library that allows you to easily use **MMKV** inside your React Native app through fast and direct JS bindings to the native C++ library.

## Features

* **Get** and **set** strings, booleans, numbers and ArrayBuffers
* **Fully synchronous** calls, no async/await, no Promises, no Bridge.
* **Encryption** support (secure storage)
* **Multiple instances** support (separate user-data with global data)
* **Customizable storage location**
* **High performance** because everything is **written in C++**
* **~30x faster than AsyncStorage**
* Uses [**JSI**](https://reactnative.dev/docs/the-new-architecture/landing-page#fast-javascriptnative-interfacing) and [**C++ NitroModules**](https://github.com/mrousavy/nitro) instead of the "old" Bridge
* **iOS**, **Android** and **Web** support
* Easy to use **React Hooks** API

> [!IMPORTANT]
> - **You're looking at MMKV V4. If you're still on V3, check out the [V3 docs here](./README_V3.md)**!
> - react-native-mmkv **V4** is now a [Nitro Module](https://nitro.margelo.com). See the [V4 Upgrade Guide](./docs/V4_UPGRADE_GUIDE.md) for more information.

## Benchmark

[StorageBenchmark](https://github.com/mrousavy/StorageBenchmark) compares popular storage libraries against each other by reading a value from storage for 1000 times:

<div align="center">
  <a href="https://github.com/mrousavy/StorageBenchmark">
    <img src="./docs/img/benchmark_1000_get.png" />
  </a>
  <p>
    <b>MMKV vs other storage libraries</b>: Reading a value from Storage 1000 times. <br/>
    Measured in milliseconds on an iPhone 11 Pro, lower is better. <br/>
  </p>
</div>

## Installation

### React Native

```sh
npm install react-native-mmkv react-native-nitro-modules
cd ios && pod install
```

### Expo

```sh
npx expo install react-native-mmkv react-native-nitro-modules
npx expo prebuild
```

## Usage

### Create a new instance

To create a new instance of the MMKV storage, use the `MMKV` constructor. It is recommended that you re-use this instance throughout your entire app instead of creating a new instance each time, so `export` the `storage` object.

#### Default

```ts
import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV()
```

This creates a new storage instance using the default MMKV storage ID (`mmkv.default`).

#### App Groups or Extensions

If you want to share MMKV data between your app and other apps or app extensions in the same group, open `Info.plist` and create an `AppGroupIdentifier` key with your app group's value. MMKV will then automatically store data inside the app group which can be read and written to from other apps or app extensions in the same group by making use of MMKV's multi processing mode.
See [Configuring App Groups](https://developer.apple.com/documentation/xcode/configuring-app-groups).

#### Customize

```ts
import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV({
  id: `user-${userId}-storage`,
  path: `${USER_DIRECTORY}/storage`,
  encryptionKey: 'hunter2',
  mode: 'multi-process',
  readOnly: false
})
```

This creates a new storage instance using a custom MMKV storage ID. By using a custom storage ID, your storage is separated from the default MMKV storage of your app.

The following values can be configured:

* `id`: The MMKV instance's ID. If you want to use multiple instances, use different IDs. For example, you can separate the global app's storage and a logged-in user's storage. (required if `path` or `encryptionKey` fields are specified, otherwise defaults to: `'mmkv.default'`)
* `path`: The MMKV instance's root path. By default, MMKV stores file inside `$(Documents)/mmkv/`. You can customize MMKV's root directory on MMKV initialization (documentation: [iOS](https://github.com/Tencent/MMKV/wiki/iOS_advance#customize-location) / [Android](https://github.com/Tencent/MMKV/wiki/android_advance#customize-location))
* `encryptionKey`: The MMKV instance's encryption/decryption key. By default, MMKV stores all key-values in plain text on file, relying on iOS's/Android's sandbox to make sure the file is encrypted. Should you worry about information leaking, you can choose to encrypt MMKV. (documentation: [iOS](https://github.com/Tencent/MMKV/wiki/iOS_advance#encryption) / [Android](https://github.com/Tencent/MMKV/wiki/android_advance#encryption))
* `mode`: The MMKV's process behaviour - when set to `multi-process`, the MMKV instance will assume data can be changed from the outside (e.g. App Clips, Extensions or App Groups).
* `readOnly`: Whether this MMKV instance should be in read-only mode. This is typically more efficient and avoids unwanted writes to the data if not needed. Any call to `set(..)` will throw.

### Set

```ts
storage.set('user.name', 'Marc')
storage.set('user.age', 21)
storage.set('is-mmkv-fast-asf', true)
```

### Get

```ts
const username = storage.getString('user.name') // 'Marc'
const age = storage.getNumber('user.age') // 21
const isMmkvFastAsf = storage.getBoolean('is-mmkv-fast-asf') // true
```

### Hooks

```ts
const [username, setUsername] = useMMKVString('user.name')
const [age, setAge] = useMMKVNumber('user.age')
const [isMmkvFastAsf, setIsMmkvFastAf] = useMMKVBoolean('is-mmkv-fast-asf')
```

### Keys

```ts
// checking if a specific key exists
const hasUsername = storage.contains('user.name')

// getting all keys
const keys = storage.getAllKeys() // ['user.name', 'user.age', 'is-mmkv-fast-asf']

// delete a specific key + value
const wasRemoved = storage.remove('user.name')

// delete all keys
storage.clearAll()
```

### Objects

```ts
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

### Encryption

```ts
// encrypt all data with a private key
storage.recrypt('hunter2')

// remove encryption
storage.recrypt(undefined)
```

### Buffers

```ts
const buffer = new ArrayBuffer(3)
const dataWriter = new Uint8Array(buffer)
dataWriter[0] = 1
dataWriter[1] = 100
dataWriter[2] = 255
storage.set('someToken', buffer)

const buffer = storage.getBuffer('someToken')
console.log(buffer) // [1, 100, 255]
```

### Size

```ts
// get size of MMKV storage in bytes
const size = storage.size
if (size >= 4096) {
  // clean unused keys and clear memory cache
  storage.trim()
}
```

### Importing all data from another MMKV instance

To import all keys and values from another MMKV instance, use `importAllFrom(...)`:

```ts
const storage = createMMKV(...)
const otherStorage = createMMKV(...)

const importedCount = storage.importAllFrom(otherStorage)
```

### Check if an MMKV instance exists

To check if an MMKV instance exists, use `existsMMKV(...)`:

```ts
import { existsMMKV } from 'react-native-mmkv'

const exists = existsMMKV('my-instance')
```

### Delete an MMKV instance

To delete an MMKV instance, use `deleteMMKV(...)`:

```ts
import { deleteMMKV } from 'react-native-mmkv'

const wasDeleted = deleteMMKV('my-instance')
```

### Log Level

By default, MMKV logs at `Debug` level in debug builds and `Warning` level in release builds. You can override this at build time to control the verbosity of MMKV's native logs.

| Value | Level |
|-------|-------|
| 0 | Debug |
| 1 | Info |
| 2 | Warning |
| 3 | Error |
| 4 | None |

#### Android

Set `MMKV_logLevel` in your app's `android/gradle.properties`:

```properties
MMKV_logLevel=4
```

#### iOS

Set `$MMKVLogLevel` in your app's `ios/Podfile`, then run `pod install`:

```ruby
$MMKVLogLevel = 4
```

Or use an environment variable during `pod install`:

```sh
MMKV_LOG_LEVEL=4 pod install
```

## Testing with Jest or Vitest

A mocked MMKV instance is automatically used when testing with Jest or Vitest, so you will be able to use `createMMKV()` as per normal in your tests. Refer to [`example/__tests__/MMKV.harness.ts`](example/__tests__/MMKV.harness.ts) for an example using Jest.

## Documentation

* [Hooks](./docs/HOOKS.md)
* [Value-change Listeners](./docs/LISTENERS.md)
* [Migrate from AsyncStorage](./docs/MIGRATE_FROM_ASYNC_STORAGE.md)
* [Using MMKV with redux-persist](./docs/WRAPPER_REDUX.md)
* [Using MMKV with recoil](./docs/WRAPPER_RECOIL.md)
* [Using MMKV with mobx-persist-storage](./docs/WRAPPER_MOBX.md)
* [Using MMKV with mobx-persist](./docs/WRAPPER_MOBXPERSIST.md)
* [Using MMKV with zustand persist-middleware](./docs/WRAPPER_ZUSTAND_PERSIST_MIDDLEWARE.md)
* [Using MMKV with jotai](./docs/WRAPPER_JOTAI.md)
* [Using MMKV with react-query](./docs/WRAPPER_REACT_QUERY.md)
* [Using MMKV with Tinybase](./docs/WRAPPER_TINYBASE.md)
* [How is this library different from **react-native-mmkv-storage**?](https://github.com/mrousavy/react-native-mmkv/issues/100#issuecomment-886477361)

## LocalStorage and In-Memory Storage (Web)

If a user chooses to disable LocalStorage in their browser, the library will automatically provide a limited in-memory storage as an alternative. However, this in-memory storage won't persist data, and users may experience data loss if they refresh the page or close their browser. To optimize user experience, consider implementing a suitable solution within your app to address this scenario.

## Limitations

- react-native-mmkv V3 requires react-native 0.74 or higher.
- react-native-mmkv V3 requires [the new architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)/TurboModules to be enabled.
- Since react-native-mmkv uses JSI for synchronous native method invocations, remote debugging (e.g. with Chrome) is no longer possible. Instead, you should use [Flipper](https://fbflipper.com) or [React DevTools](https://react.dev/learn/react-developer-tools).

## Integrations

### Rozenite

Use [@rozenite/mmkv-plugin](https://www.rozenite.dev/docs/official-plugins/mmkv) to debug your MMKV storage using Rozenite.

### Reactotron

Use [reactotron-react-native-mmkv](https://www.npmjs.com/package/reactotron-react-native-mmkv) to automatically log writes to your MMKV storage using Reactotron. [See the docs for how to setup this plugin with Reactotron.](https://www.npmjs.com/package/reactotron-react-native-mmkv)

## Community Discord

[**Join the Margelo Community Discord**](https://margelo.com/discord) to chat about react-native-mmkv or other Margelo libraries.

## Adopting at scale

react-native-mmkv is provided _as is_, I work on it in my free time.

If you're integrating react-native-mmkv in a production app, consider [funding this project](https://github.com/sponsors/mrousavy) and <a href="mailto:me@mrousavy.com?subject=Adopting react-native-mmkv at scale">contact me</a> to receive premium enterprise support, help with issues, prioritize bugfixes, request features, help at integrating react-native-mmkv, and more.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
