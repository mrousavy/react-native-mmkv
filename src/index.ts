const g = global as any;

/**
 * MMKV is an efficient, small mobile key-value storage framework developed by WeChat.
 */
export const MMKV = {
  /**
   * Set a value for the given `key`.
   */
  set: g.mmkvSet as (value: boolean | string | number, key: string) => void,
  /**
   * Get a boolean value for the given `key`.
   */
  getBoolean: g.mmkvGetBoolean as (key: string) => boolean,
  /**
   * Get a string value for the given `key`.
   */
  getString: g.mmkvGetString as (key: string) => string,
  /**
   * Get a number value for the given `key`.
   */
  getNumber: g.mmkvGetNumber as (key: string) => number,
  /**
   * Delete the given `key`.
   */
  delete: g.mmkvDelete as (key: string) => void,
  /**
   * Get all keys.
   */
  getAllKeys: g.mmkvGetAllKeys as () => string[],
};
