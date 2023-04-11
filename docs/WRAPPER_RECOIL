# recoil storage wrapper

If you want to use MMKV with [recoil](https://recoiljs.org/), Use the following persist code:

```tsx
const persistAtom = (key) => ({ setSelf, onSet }) => {
  setSelf(() => {
    let data = storage.getString(key);
    if (data != null){
      return JSON.parse(data);
    } else {
      return new DefaultValue();
    }
  });

  onSet((newValue, _, isReset) => {
    if (isReset) {
      storage.delete(key);
    } else {
      storage.set(key, JSON.stringify(newValue));
    }
  });
};
```
