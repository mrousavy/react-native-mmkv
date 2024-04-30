import { MMKV } from 'react-native-mmkv';

describe('Example test', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = new MMKV();
  });

  it('functions correctly', () => {
    storage.set('testString', 'value');
    storage.set('testNumber', 99);
    storage.set('testBoolean', false);

    expect(storage.getString('testString')).toStrictEqual('value');
    expect(storage.getNumber('testString')).toBeUndefined();
    expect(storage.getBoolean('testString')).toBeUndefined();
    expect(storage.getString('testNumber')).toBeUndefined();
    expect(storage.getNumber('testNumber')).toStrictEqual(99);
    expect(storage.getBoolean('testNumber')).toBeUndefined();
    expect(storage.getString('testBoolean')).toBeUndefined();
    expect(storage.getNumber('testBoolean')).toBeUndefined();
    expect(storage.getBoolean('testBoolean')).toStrictEqual(false);
    expect(storage.getAllKeys()).toEqual(
      expect.arrayContaining(['testString', 'testNumber', 'testBoolean'])
    );

    storage.delete('testBoolean');
    expect(storage.contains('testBoolean')).toBeFalsy();
    expect(storage.getAllKeys()).toEqual(
      expect.arrayContaining(['testString', 'testNumber'])
    );

    storage.clearAll();
    expect(storage.toString()).toStrictEqual('MMKV (mmkv.default): []');
  });
});
