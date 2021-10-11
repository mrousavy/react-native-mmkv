import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { MMKV, MMKVConfiguration, MMKVInterface } from 'react-native-mmkv';

function isConfigurationEqual(
  left: MMKVConfiguration,
  right: MMKVConfiguration
): boolean {
  return (
    left.encryptionKey === right.encryptionKey &&
    left.id === right.id &&
    left.path === right.path
  );
}

let defaultInstance: MMKVInterface | null = null;
function getDefaultInstance(): MMKVInterface {
  if (defaultInstance == null) {
    defaultInstance = new MMKV();
  }
  return defaultInstance;
}

export function useMMKV(
  configuration: MMKVConfiguration
): React.RefObject<MMKVInterface> {
  const instance = useRef<MMKVInterface>();

  const lastConfiguration = useRef<MMKVConfiguration>(configuration);
  if (!isConfigurationEqual(lastConfiguration.current, configuration)) {
    instance.current = new MMKV(configuration);
  }

  // @ts-expect-error it's not null, I promise.
  return instance;
}

function createMMKVHook<T extends boolean | number | (string | undefined)>(
  getter: (instance: MMKVInterface, key: string) => T
) {
  return (
    key: string,
    instance?: MMKVInterface
  ): [value: T, setValue: (value: T | ((current: T) => T)) => void] => {
    const mmkv = instance ?? getDefaultInstance();
    const [value, setValue] = useState(() => getter(mmkv, key));

    const set = useCallback(
      (v: T | ((current: T) => T)) => {
        const newValue = typeof v === 'function' ? v(value) : v;
        switch (typeof newValue) {
          case 'number':
          case 'string':
          case 'boolean':
            mmkv.set(key, newValue);
            break;
          case 'undefined':
            mmkv.delete(key);
            break;
          default:
            throw new Error(`MMKV: Type ${typeof newValue} is not supported!`);
        }
      },
      [key, mmkv, value]
    );

    useEffect(() => {
      const listener = mmkv.addOnValueChangedListener((changedKey) => {
        if (changedKey === key) {
          setValue(getter(mmkv, key));
        }
      });
      return () => listener.remove();
    }, [key, mmkv]);

    return useMemo(() => [value, set], [value, set]);
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
 * const [age, setAge] = useNumber("user.age")
 * ```
 */
export const useNumber = createMMKVHook((instance, key) =>
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
  instance?: MMKVInterface
): [value: T | undefined, setValue: (value: T) => void] {
  const [string, setString] = useMMKVString(key, instance);

  const value = useMemo(() => {
    if (string == null) return undefined;
    return JSON.parse(string) as T;
  }, [string]);
  const setValue = useCallback(
    (v: T) => {
      setString(JSON.stringify(v));
    },
    [setString]
  );

  return [value, setValue];
}
