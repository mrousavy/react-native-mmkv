# Hooks

react-native-mmkv provides an easy to use React-Hooks API to be used in Function Components.

## Reactively use individual keys

```tsx
function App() {
  const [username, setUsername] = useMMKVString("user.name")
  const [age, setAge] = useMMKVNumber("user.age")
  const [isPremiumUser, setIsPremiumUser] = useMMKVBoolean("user.isPremium")
}
```

## Clear a key

```tsx
function App() {
  const [username, setUsername] = useMMKVString("user.name")
  // ...
  const onLogout = useCallback(() => {
    setUsername(undefined)
  }, [])
}
```

## Objects

```tsx
type User = {
  id: string
  username: string
  age: number
}

function App() {
  const [user, setUser] = useMMKVObject<User>("user")
}
```

## Reactively use an MMKV Instance

```tsx
function App() {
  const storage = useMMKV()
  // ...
  const onLogin = useCallback((username) => {
    storage.set("user.name", "Marc")
  }, [storage])
}
```

## Reactively use individual keys from custom instances

```tsx
function App() {
  const globalStorage = useMMKV()
  const userStorage = useMMKV({ id: `${userId}.storage` })

  const [username, setUsername] = useMMKVString("user.name", userStorage)
}
```

## Reactively use MMKV Value Changed Listener

```tsx
function App() {
  const userStorage = useMMKV({ id: `${userId}.storage` })

  useMMKVValueChangedListener((changedKey, store) => {
    console.log(
      `"${changedKey}" new value: ${store.getString(
        changedKey
      )}`
    )
  }, userStorage.current)

  const onLogin = useCallback(() => {
    userStorage.current.set("user.name", "Marc")
  }, [userStorage])
}
```
