export const MMKV = {
  /**
   * Set a value for the given `key`.
   */
  set: (key: string, value: boolean | string | number): void => {
    localStorage.setItem(key, value.toString());
  },
  /**
   * Get a boolean value for the given `key`.
   *
   * @default false
   */
  getBoolean: (key: string): boolean => {
    var result = localStorage.getItem(key);

    if (result) {
      return Boolean(result);
    }

    return false;
  },
  /**
   * Get a string value for the given `key`.
   *
   * @default undefined
   */
  getString: (key: string): string | undefined => {
    var result = localStorage.getItem(key);

    if (result) {
      return result;
    }

    return undefined;
  },
  /**
   * Get a number value for the given `key`.
   *
   * @default 0
   */
  getNumber: (key: string): number => {
    var result = localStorage.getItem(key);

    if (result) {
      return Number(result);
    }

    return 0;
  },
  /**
   * Delete the given `key`.
   */
  delete: (key: string): void => {
    localStorage.removeItem(key);
  },
  /**
   * Get all keys.
   *
   * @default []
   */
  getAllKeys: (): string[] => {
    var keys = [] as string[];

    for (var i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i) as string);
    }

    return keys;
  },
}


