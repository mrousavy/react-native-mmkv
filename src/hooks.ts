import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { MMKV, MMKVConfiguration } from './MMKV';

function isConfigurationEqual(
  left?: MMKVConfiguration,
  right?: MMKVConfiguration
): boolean {
  if (left == null || right == null) return left == null && right == null;

  return (
    left.encryptionKey === right.encryptionKey &&
    left.id === right.id &&
    left.path === right.path
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
export function useMMKV(): MMKV;
/**
 * Use a custom MMKV instance with the given configuration.
 * @param configuration The configuration to initialize the MMKV instance with. Does not have to be memoized.
 */
export function useMMKV(configuration: MMKVConfiguration): MMKV;
export function useMMKV(configuration?: MMKVConfiguration): MMKV {
  const instance = useRef<MMKV>();
  const lastConfiguration = useRef<MMKVConfiguration>();

  if (configuration == null) return getDefaultInstance();

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
  T extends (boolean | number | string | Uint8Array) | undefined,
  TSet extends T | undefined,
  TSetAction extends TSet | ((current: T) => TSet)
>(getter: (instance: MMKV, key: string) => T) {
  return (
    key: string,
    instance?: MMKV
  ): [value: T, setValue: (value: TSetAction) => void] => {
    const mmkv = instance ?? getDefaultInstance();
    const [value, setValue] = useState(() => getter(mmkv, key));

    // update value by user set
    const set = useCallback(
      (v: TSetAction) => {
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
            if (newValue instanceof Uint8Array) {
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

    // update value if key or instance changes
    useEffect(() => {
      setValue(getter(mmkv, key));
    }, [key, mmkv]);

    // update value if it changes somewhere else (second hook, same key)
    useEffect(() => {
      const listener = mmkv.addOnValueChangedListener((changedKey) => {
        if (changedKey === key) {
          setValue(getter(mmkv, key));
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
export const useMMKVString = createMMKVHook((instance, key) =>
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
export const useMMKVNumber = createMMKVHook((instance, key) =>
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
export const useMMKVBoolean = createMMKVHook((instance, key) =>
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
export const useMMKVBuffer = createMMKVHook((instance, key) =>
  instance.getBuffer(key)
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
export function useMMKVObject<T>(
  key: string,
  instance?: MMKV
): [value: T | undefined, setValue: (value: T | undefined) => void] {
  const [string, setString] = useMMKVString(key, instance);

  const value = useMemo(() => {
    if (string == null) return undefined;
    return JSON.parse(string) as T;
  }, [string]);
  const setValue = useCallback(
    (v: T | undefined) => {
      if (v == null) {
        // Clear the Value
        setString(undefined);
      } else {
        // Store the Object as a serialized Value
        setString(JSON.stringify(v));
      }
    },
    [setString]
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
