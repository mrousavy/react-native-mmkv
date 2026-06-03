# Listeners

MMKV instances also contain an observer/listener registry.

### Add a listener when a `key`'s `value` changes.

```ts
const storage = createMMKV()

const listener = storage.addOnValueChangedListener((changedKey) => {
  const newValue = storage.getString(changedKey)
  console.log(`"${changedKey}" new value: ${newValue}`)
})
```

### Listen to native changes from another process.

On native platforms, MMKV can detect changes from another process, such as an app
extension, App Clip, or background service. These changes are routed through
`addOnValueChangedListener(...)` as well.

MMKV does not report the exact changed key for external changes, so React Native
MMKV conservatively notifies listeners for all currently known keys and all
previously known keys. This ensures value hooks and `useMMKVKeys()` refresh for
adds, updates, and deletes.

```ts
const storage = createMMKV({
  id: 'shared-storage',
  mode: 'multi-process',
})

const listener = storage.addOnValueChangedListener((changedKey) => {
  const value = storage.getString(changedKey)
  console.log(`"${changedKey}" might have changed: ${value}`)
})
```

You can also force MMKV to check for external changes:

```ts
storage.checkExternalContentChanged()
```

The built-in `useMMKV*` value hooks and `useMMKVKeys()` automatically refresh
when this native event fires.

Don't forget to remove the listener when no longer needed. For example, when the user logs out:

```ts
function SettingsScreen() {
  // ...

  const onLogout = useCallback(() => {
    // ...
    listener.remove()
  }, [])

  // ...
}
```
