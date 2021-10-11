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

Don't forget to remove the listener when no longer needed. For example, in a `useEffect` hook:

```ts
useEffect(() => {
  const listener = storage.addOnValueChangedListener((changedKey) => {
    const newValue = storage.getString(changedKey)
    console.log(`"${changedKey}" new value: ${newValue}`)
  })
  // cleanup function
  return () => {
    listener.remove()
  }
}, [storage])
```
