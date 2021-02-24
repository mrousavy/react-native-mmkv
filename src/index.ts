const g = global as any;

export const MMKV = {
  set: g.mmkvSet as (value: boolean | string | number, key: string) => void,
  getBoolean: g.mmkvGetBoolean as (key: string) => boolean,
  getString: g.mmkvGetString as (key: string) => string,
  getNumber: g.mmkvGetNumber as (key: string) => number,
  delete: g.mmkvDelete as (key: string) => void,
  getAllKeys: g.mmkvGetAllKeys as () => string[],
};
