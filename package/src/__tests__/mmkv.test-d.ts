/* eslint-disable react-hooks/rules-of-hooks */
import { expectType, expectError } from 'tsd';
import { MMKV } from '../MMKV';
import {
  useMMKVNumber,
  useMMKVObject,
  useMMKV,
  useMMKVBoolean,
  useMMKVString,
  useMMKVBuffer,
} from '../hooks';

export type TestStorageValues = {
  someString: string;
  someNumber: number;
  someOtherNumber: number;
  someBoolean: boolean;
  someBuffer: ArrayBuffer;
};

const typedStorage = new MMKV<TestStorageValues>();
const nonTypedStorage = new MMKV();

// Types test for non-typed storage:
expectType<void>(nonTypedStorage.set('someRandomKey', 'some-token'));
expectType<string | undefined>(nonTypedStorage.getString('someOtherKey'));

// Valid type usages for typed storage:
typedStorage.set('someString', 'some-token');
expectType<string | undefined>(typedStorage.getString('someString'));

typedStorage.set('someNumber', 1);
typedStorage.set('someOtherNumber', 2);
expectType<number | undefined>(typedStorage.getNumber('someNumber'));
expectType<number | undefined>(typedStorage.getNumber('someOtherNumber'));

typedStorage.set('someBoolean', true);
expectType<boolean | undefined>(typedStorage.getBoolean('someBoolean'));

typedStorage.set('someBuffer', new ArrayBuffer(10));
expectType<ArrayBufferLike | undefined>(typedStorage.getBuffer('someBuffer'));

expectType<(keyof TestStorageValues)[]>(typedStorage.getAllKeys());
expectType<boolean>(typedStorage.contains('someString'));
typedStorage.addOnValueChangedListener((key) => {
  expectType<keyof TestStorageValues>(key);
});

// Invalid type usages (should cause TypeScript errors):

// These cases should fail because "fooBar" is not a valid key:
expectError(typedStorage.set('fooBar', 'someString'));
expectError(typedStorage.delete('fooBar'));
expectError(typedStorage.contains('fooBar'));
expectError(typedStorage.getString('fooBar'));
expectError(typedStorage.getNumber('fooBar'));
expectError(typedStorage.getBoolean('fooBar'));
expectError(typedStorage.getBuffer('fooBar'));

// These cases should fail because values are of the wrong type, while keys are valid:
expectError(typedStorage.set('someString', 123));
expectError(typedStorage.set('someNumber', '123'));
expectError(typedStorage.set('someBoolean', 123));
expectError(typedStorage.set('someBuffer', '123'));

// These cases should fail because methods expect keys of the correct type:
expectError(typedStorage.getString('someBoolean'));
expectError(typedStorage.getBoolean('someString'));
expectError(typedStorage.getNumber('someBoolean'));
expectError(typedStorage.getBuffer('someString'));

// Tests for hooks types.

// Tests for useMMKV hook
const localTypedStorage = useMMKV<TestStorageValues>();
expectType<void>(localTypedStorage.set('someString', 'some-token'));
expectType<string | undefined>(localTypedStorage.getString('someString'));
expectType<(keyof TestStorageValues)[]>(localTypedStorage.getAllKeys());

// Valid type usages for typed storage with hooks:
const [someString, setSomeString] = useMMKVString('someString', typedStorage);
expectType<string | undefined>(someString);
expectType<void>(setSomeString('some-token'));

const [someNumber, setSomeNumber] = useMMKVNumber('someNumber', typedStorage);
expectType<number | undefined>(someNumber);
expectType<void>(setSomeNumber(1));

const [someBoolean, setSomeBoolean] = useMMKVBoolean(
  'someBoolean',
  typedStorage
);
expectType<boolean | undefined>(someBoolean);
expectType<void>(setSomeBoolean(true));

const [someBuffer, setSomeBuffer] = useMMKVBuffer('someBuffer', typedStorage);
expectType<ArrayBufferLike | undefined>(someBuffer);
expectType<void>(setSomeBuffer(new ArrayBuffer(10)));

type SomeObject = {
  foo: string;
  bar: number;
};

// Objects are stored as JSON strings, so we need to specify the type of the object:
const [someObject, setSomeObject] = useMMKVObject<
  SomeObject,
  TestStorageValues
>('someString', typedStorage);
expectType<SomeObject | undefined>(someObject);
expectType<void>(setSomeObject({ foo: 'baz', bar: 2 }));

// Invalid type usages for hooks:

// These cases should fail because the key does not match the type of hook value:
expectError(useMMKVString('someBoolean', typedStorage));
expectError(useMMKVNumber('someString', typedStorage));
expectError(useMMKVBoolean('someNumber', typedStorage));
expectError(useMMKVBuffer('someString', typedStorage));

// These cases should fail because the key does not match the type of hook setter:
expectError(setSomeString(1));
expectError(setSomeNumber('1'));
expectError(setSomeBoolean(1));
expectError(setSomeBuffer('1'));

// These cases should fail becase keys are not present in the typed storage:
expectError(useMMKVString('someOtherKey', typedStorage));
expectError(useMMKVNumber('someOtherKey', typedStorage));
expectError(useMMKVBoolean('someOtherKey', typedStorage));
expectError(useMMKVBuffer('someOtherKey', typedStorage));
