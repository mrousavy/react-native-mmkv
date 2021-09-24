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

export function useMMKVString(
  key: string,
  instance?: MMKVInterface
): [value: string | undefined, setValue: (value: string) => void] {
  const mmkv = instance ?? getDefaultInstance();
  const [value, setValue] = useState(() => mmkv.getString(key));

  const set = useCallback(
    (v: string) => {
      mmkv.set(key, v);
      setValue(v);
    },
    [key, mmkv]
  );

  useEffect(() => {
    const listener = mmkv.addOnValueChangedListener((changedKey) => {
      if (changedKey === key) {
        setValue(mmkv.getString(key));
      }
    });
    return () => listener.remove();
  }, [key, mmkv]);

  return useMemo(() => [value, set], [value, set]);
}

export function useMMKVNumber(
  key: string,
  instance?: MMKVInterface
): [value: number, setValue: (value: number) => void] {
  const mmkv = instance ?? getDefaultInstance();
  const [value, setValue] = useState(() => mmkv.getNumber(key));

  const set = useCallback(
    (v: number) => {
      mmkv.set(key, v);
      setValue(v);
    },
    [key, mmkv]
  );

  useEffect(() => {
    const listener = mmkv.addOnValueChangedListener((changedKey) => {
      if (changedKey === key) {
        setValue(mmkv.getNumber(key));
      }
    });
    return () => listener.remove();
  }, [key, mmkv]);

  return useMemo(() => [value, set], [value, set]);
}

export function useMMKVBoolean(
  key: string,
  instance?: MMKVInterface
): [value: boolean, setValue: (value: boolean) => void] {
  const mmkv = instance ?? getDefaultInstance();
  const [value, setValue] = useState(() => mmkv.getBoolean(key));

  const set = useCallback(
    (v: boolean) => {
      mmkv.set(key, v);
      setValue(v);
    },
    [key, mmkv]
  );

  useEffect(() => {
    const listener = mmkv.addOnValueChangedListener((changedKey) => {
      if (changedKey === key) {
        setValue(mmkv.getBoolean(key));
      }
    });
    return () => listener.remove();
  }, [key, mmkv]);

  return useMemo(() => [value, set], [value, set]);
}
