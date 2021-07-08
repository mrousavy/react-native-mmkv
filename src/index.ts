const g = global as any;

/**
 * MMKV is an efficient, small mobile key-value storage framework developed by WeChat.
 */
export const MMKV = {
  /**
   * Set a value for the given `key`.
   */
  set: g.mmkvSet as (key: string, value: boolean | string | number) => void,
  /**
   * Get a boolean value for the given `key`.
   *
   * @default false
   */
  getBoolean: g.mmkvGetBoolean as (key: string) => boolean,
  /**
   * Get a string value for the given `key`.
   *
   * @default undefined
   */
  getString: g.mmkvGetString as (key: string) => string | undefined,
  /**
   * Get a number value for the given `key`.
   *
   * @default 0
   */
  getNumber: g.mmkvGetNumber as (key: string) => number,
  /**
   * Delete the given `key`.
   */
  delete: g.mmkvDelete as (key: string) => void,
  /**
   * Get all keys.
   *
   * @default []
   */
  getAllKeys: g.mmkvGetAllKeys as () => string[],
  /**
   * Delete all keys.
   */
  clearAll: g.mmkvClearAll as () => void,
};
