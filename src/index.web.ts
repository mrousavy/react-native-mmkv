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
    let result = localStorage.getItem(key);

    return result ? Boolean(result) : false;
  },
  /**
   * Get a string value for the given `key`.
   *
   * @default undefined
   */
  getString: (key: string): string | undefined => {
    let result = localStorage.getItem(key);

    return result != null ? result : undefined;
  },
  /**
   * Get a number value for the given `key`.
   *
   * @default 0
   */
  getNumber: (key: string): number => {
    let result = localStorage.getItem(key);

    return result ? Number(result) : 0;
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
    return Object.keys(localStorage);
  },
}


