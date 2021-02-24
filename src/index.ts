const g = global as any;

export const MMKV = {
  set: g.mmkvSet as (value: boolean | string | number, key: string) => void,
  getBoolean: g.getBoolean as (key: string) => boolean,
  getString: g.getString as (key: string) => string,
  getNumber: g.getNumber as (key: string) => number,
};
