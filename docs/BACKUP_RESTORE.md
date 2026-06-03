# Backup and Restore

MMKV can back up and restore its native storage files to and from a directory.

```ts
import { createMMKV } from 'react-native-mmkv'

const storage = createMMKV({ id: 'user-storage' })

storage.backupToDirectory('/path/to/backup')
storage.restoreFromDirectory('/path/to/backup')
```

For one specific instance, use `backupMMKV(...)` and `restoreMMKV(...)`:

```ts
import { backupMMKV, restoreMMKV } from 'react-native-mmkv'

backupMMKV({
  id: 'user-storage',
  destinationDirectory: '/path/to/backup',
})

restoreMMKV({
  id: 'user-storage',
  sourceDirectory: '/path/to/backup',
})
```

For every MMKV file in a root path, use `backupAllMMKV(...)` and `restoreAllMMKV(...)`:

```ts
import { backupAllMMKV, restoreAllMMKV } from 'react-native-mmkv'

const backupCount = backupAllMMKV({
  destinationDirectory: '/path/to/backup',
})

const restoreCount = restoreAllMMKV({
  sourceDirectory: '/path/to/backup',
})
```

If the MMKV instance uses a custom `path`, pass that same path as `rootPath` to the top-level APIs:

```ts
backupMMKV({
  id: 'user-storage',
  destinationDirectory: '/path/to/backup',
  rootPath: '/path/to/mmkv-root',
})
```

Backup and restore are native-only APIs. They are not supported on Web. The source and destination directories must be writable native filesystem paths.
