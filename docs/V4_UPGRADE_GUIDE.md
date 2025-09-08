# V4 Upgrade Guide

react-native-mmkv v4 has been fully rewritten to [nitro](https://nitro.margelo.com), which greatly simplifies the codebase, optimized native calls, and optimized the implementation.
Ideally, this means;

- **Backwards compatible for old architecture** again thanks to Nitro 🥳
- Easier to maintain, allows for PRs from people without JSI experience 🫂
- Lightweight & fast native calls thanks to Nitro 🔥

Also, the core MMKV library is now consumed from the official distribution channels - that is **CocoaPods** on iOS, and **Gradle Prefabs** on Android.
This means you can use MMKV Core from _your native code_ again by just adding it to your `Podfile`/`build.gradle` dependencies!

## Breaking changes

There have been a few breaking changes. This guide will help you migrate over from V3 to V4:

### Nitro Modules dependency

Since react-native-mmkv is now a Nitro Module, you need to install the [react-native-nitro-modules](https://github.com/mrousavy/nitro) core dependency in your app:

```sh
npm install react-native-nitro-modules
```

> Nitro requires **react-native 0.75.0** or higher. See [the Troubleshooting guide](https://nitro.margelo.com/docs/troubleshooting) if you run into any issues.

### `new MMKV(...)` -> `createMMKV(...)`

The `MMKV` JS-class no longer exists - instead it is now purely native. This means, you have to change your MMKV creation code:

```diff
- const storage = new MMKV()
+ const storage = createMMKV()
```

### `.delete(...)` -> `.remove(...)`

The `MMKV.delete(...)` function has been renamed to `MMKV.remove(...)`, since `delete` is a reserved keyword in C++:

```diff
- storage.delete('my-key')
+ storage.remove('my-key')
```

### `AppGroup` -> `AppGroupIdentifier`

To better comply with Apple's naming, I changed the `AppGroup` key to `AppGroupIdentifier`. If you used MMKV with App Groups, make sure you change the key in your `Info.plist`:

```diff
- <key>AppGroup</key>
+ <key>AppGroupIdentifier</key>
```


## Troubleshooting

### iOS build failed: `The following Swift pods cannot yet be integrated as static libraries`

If you get an iOS `pod install` error that looks like this:

```
⚠️  Something went wrong running `pod install` in the `ios` directory.
Command `pod install` failed.
└─ Cause: The following Swift pods cannot yet be integrated as static libraries:

The Swift pod `NitroMmkv` depends upon `MMKVCore`, which does not define modules. To opt into those targets generating module maps (which is necessary to import them from Swift when building as static libraries), you may set `use_modular_headers!` globally in your Podfile, or specify `:modular_headers => true` for particular dependencies.
```

..you need to upgrade `MMKVCore` to a version that includes [this PR](https://github.com/Tencent/MMKV/pull/1579) (v2.2.4 or higher), or add this to your `Podfile`:

```rb
pod 'MMKVCore', :modular_headers => true
```
