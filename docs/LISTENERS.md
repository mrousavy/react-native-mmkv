# Listeners

MMKV instances also contain an observer/listener registry.

### Add a listener when a `key`'s `value` changes.

```ts
const storage = new MMKV()

const listener = storage.addOnValueChangedListener((changedKey) => {
  const newValue = storage.getString(changedKey)
  console.log(`"${changedKey}" new value: ${newValue}`)
})
```

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
