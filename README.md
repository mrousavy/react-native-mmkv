<div align="center">
  <h1>MMKV</h1>
</div>

**MMKV** is an efficient, small mobile key-value storage framework developed by WeChat.

> See [Tencent/MMKV](https://github.com/Tencent/MMKV) for more information

**react-native-mmkv** provides an interface to access MMKV functionality through synchronous JS functions using **JSI**.
This means, there is **no bridge-traffic**, everything runs **synchronously**, no Promise-awaiting, and it's **fast asf**.

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

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
