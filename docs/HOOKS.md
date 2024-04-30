# Hooks

react-native-mmkv provides an easy to use React-Hooks API to be used in Function Components.

## Reactively use individual keys

```tsx
function App() {
  const [username, setUsername] = useMMKVString("user.name")
  const [age, setAge] = useMMKVNumber("user.age")
  const [isPremiumUser, setIsPremiumUser] = useMMKVBoolean("user.isPremium")
  const [privateKey, setPrivateKey] = useMMKVBuffer("user.privateKey")
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

## Listen to value changes

```tsx
function App() {
  useMMKVListener((key) => {
    console.log(`Value for "${key}" changed!`)
  })
}
```

## Listen to value changes on a specific instance

```tsx
function App() {
  const storage = useMMKV({ id: `${userId}.storage` })

  useMMKVListener((key) => {
    console.log(`Value for "${key}" changed in user storage!`)
  }, storage)
}
```
