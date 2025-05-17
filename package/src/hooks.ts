import {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
  SetStateAction,
} from 'react';
import { MMKV } from './MMKV';
import type {
  Configuration,
  DefaultStorage,
  KeysOfType,
  SupportedTypes,
} from './Types';

function isConfigurationEqual(
  left?: Configuration,
  right?: Configuration
): boolean {
  if (left == null || right == null) return left == null && right == null;

  return (
    left.encryptionKey === right.encryptionKey &&
    left.id === right.id &&
    left.path === right.path &&
    left.mode === right.mode
  );
}

let defaultInstance: MMKV | null = null;
function getDefaultInstance(): MMKV {
  if (defaultInstance == null) {
    defaultInstance = new MMKV();
  }
  return defaultInstance;
}

/**
 * Use the default, shared MMKV instance.
 */
export function useMMKV<
  TStorage extends DefaultStorage = DefaultStorage,
>(): MMKV<TStorage>;
/**
 * Use a custom MMKV instance with the given configuration.
 * @param configuration The configuration to initialize the MMKV instance with. Does not have to be memoized.
 */
export function useMMKV<TStorage extends DefaultStorage = DefaultStorage>(
  configuration: Configuration
): MMKV<TStorage>;
export function useMMKV<TStorage extends DefaultStorage = DefaultStorage>(
  configuration?: Configuration
): MMKV<TStorage> {
  const instance = useRef<MMKV<TStorage>>();
  const lastConfiguration = useRef<Configuration>();

  if (configuration == null) return getDefaultInstance() as MMKV<TStorage>;

  if (
    instance.current == null ||
    !isConfigurationEqual(lastConfiguration.current, configuration)
  ) {
    lastConfiguration.current = configuration;
    instance.current = new MMKV(configuration);
  }

  return instance.current;
}

function createMMKVHook<
  T extends SupportedTypes,
  TSet extends T | undefined = T | undefined,
>(getter: (instance: MMKV<Record<string, T>>, key: string) => TSet) {
  return <TStorage extends DefaultStorage | undefined = undefined>(
    key: TStorage extends DefaultStorage ? KeysOfType<TStorage, TSet> : string,
    instance?: TStorage extends DefaultStorage ? MMKV<TStorage> : MMKV
  ): [value: TSet, setValue: (value: SetStateAction<TSet>) => void] => {
    const mmkv = instance ?? getDefaultInstance();

    const [bump, setBump] = useState(0);
    const value = useMemo(() => {
      // bump is here as an additional outside dependency, so this useMemo
      // re-computes the value each time bump changes, effectively acting as a hint
      // that the outside value (storage) has changed. setting bump refreshes this value.
      bump;
      return getter(mmkv, key);
    }, [mmkv, key, bump]);

    // update value by user set
    const set = useCallback(
      (v: SetStateAction<TSet>) => {
        const newValue = typeof v === 'function' ? v(getter(mmkv, key)) : v;
        switch (typeof newValue) {
          case 'number':
          case 'string':
          case 'boolean':
            mmkv.set(key, newValue);
            break;
          case 'undefined':
            mmkv.delete(key);
            break;
          case 'object':
            if (newValue instanceof ArrayBuffer) {
              mmkv.set(key, newValue);
              break;
            } else {
              throw new Error(
                `MMKV: Type object (${newValue}) is not supported!`
              );
            }
          default:
            throw new Error(`MMKV: Type ${typeof newValue} is not supported!`);
        }
      },
      [key, mmkv]
    );

    // update value if it changes somewhere else (second hook, same key)
    useEffect(() => {
      const listener = mmkv.addOnValueChangedListener((changedKey) => {
        if (changedKey === key) {
          setBump((b) => b + 1);
        }
      });
      return () => listener.remove();
    }, [key, mmkv]);

    return [value, set];
  };
}

/**
 * Use the string value of the given `key` from the given MMKV storage instance.
 *
 * If no instance is provided, a shared default instance will be used.
 *
 * @example
 * ```ts
 * const [username, setUsername] = useMMKVString("user.name")
 * ```
 */
export const useMMKVString = createMMKVHook<string>((instance, key) =>
  instance.getString(key)
);

/**
 * Use the number value of the given `key` from the given MMKV storage instance.
 *
 * If no instance is provided, a shared default instance will be used.
 *
 * @example
 * ```ts
 * const [age, setAge] = useMMKVNumber("user.age")
 * ```
 */
export const useMMKVNumber = createMMKVHook<number>((instance, key) =>
  instance.getNumber(key)
);
/**
 * Use the boolean value of the given `key` from the given MMKV storage instance.
 *
 * If no instance is provided, a shared default instance will be used.
 *
 * @example
 * ```ts
 * const [isPremiumAccount, setIsPremiumAccount] = useMMKVBoolean("user.isPremium")
 * ```
 */
export const useMMKVBoolean = createMMKVHook<boolean>((instance, key) =>
  instance.getBoolean(key)
);
/**
 * Use the buffer value (unsigned 8-bit (0-255)) of the given `key` from the given MMKV storage instance.
 *
 * If no instance is provided, a shared default instance will be used.
 *
 * @example
 * ```ts
 * const [privateKey, setPrivateKey] = useMMKVBuffer("user.privateKey")
 * ```
 */
export const useMMKVBuffer = createMMKVHook<ArrayBuffer | ArrayBufferLike>(
  (instance, key) => instance.getBuffer(key)
);
/**
 * Use an object value of the given `key` from the given MMKV storage instance.
 *
 * If no instance is provided, a shared default instance will be used.
 *
 * The object will be serialized using `JSON`.
 *
 * @example
 * ```ts
 * const [user, setUser] = useMMKVObject<User>("user")
 * ```
 */
export function useMMKVObject<T, TStorage extends DefaultStorage | undefined>(
  key: TStorage extends DefaultStorage ? keyof TStorage : string,
  instance?: TStorage extends DefaultStorage ? MMKV<TStorage> : MMKV
): [
  value: T | undefined,
  setValue: (value: SetStateAction<T | undefined>) => void,
] {
  const [json, setJson] = useMMKVString(key, instance);

  const value = useMemo(() => {
    if (json == null) return undefined;
    return JSON.parse(json) as T;
  }, [json]);

  const setValue = useCallback(
    (v: SetStateAction<T | undefined>) => {
      if (v instanceof Function) {
        setJson((currentJson) => {
          const currentValue =
            currentJson != null ? (JSON.parse(currentJson) as T) : undefined;
          const newValue = v(currentValue);
          // Store the Object as a serialized Value or clear the value
          return newValue != null ? JSON.stringify(newValue) : undefined;
        });
      } else {
        // Store the Object as a serialized Value or clear the value
        const newValue = v != null ? JSON.stringify(v) : undefined;
        setJson(newValue);
      }
    },
    [setJson]
  );

  return [value, setValue];
}

/**
 * Listen for changes in the given MMKV storage instance.
 * If no instance is passed, the default instance will be used.
 * @param valueChangedListener The function to call whenever a value inside the storage instance changes
 * @param instance The instance to listen to changes to (or the default instance)
 *
 * @example
 * ```ts
 * useMMKVListener((key) => {
 *   console.log(`Value for "${key}" changed!`)
 * })
 * ```
 */
export function useMMKVListener(
  valueChangedListener: (key: string) => void,
  instance?: MMKV
): void {
  const ref = useRef(valueChangedListener);
  ref.current = valueChangedListener;

  const mmkv = instance ?? getDefaultInstance();

  useEffect(() => {
    const listener = mmkv.addOnValueChangedListener((changedKey) => {
      ref.current(changedKey);
    });
    return () => listener.remove();
  }, [mmkv]);
}
