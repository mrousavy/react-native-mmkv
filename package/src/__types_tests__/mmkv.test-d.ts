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

// ===== MMKV Instance Tests =====

// Non-typed storage tests
const nonTypedStorage = new MMKV();
expectType<void>(nonTypedStorage.set('someRandomKey', 'some-token'));
expectType<string | undefined>(nonTypedStorage.getString('someOtherKey'));

// Typed storage tests
const typedStorage = new MMKV<TestStorageValues>();

// Valid type usages for typed storage
// String operations
typedStorage.set('someString', 'some-token');
expectType<string | undefined>(typedStorage.getString('someString'));

// Number operations
typedStorage.set('someNumber', 1);
typedStorage.set('someOtherNumber', 2);
expectType<number | undefined>(typedStorage.getNumber('someNumber'));
expectType<number | undefined>(typedStorage.getNumber('someOtherNumber'));

// Boolean operations
typedStorage.set('someBoolean', true);
expectType<boolean | undefined>(typedStorage.getBoolean('someBoolean'));

// Buffer operations
typedStorage.set('someBuffer', new ArrayBuffer(10));
expectType<ArrayBufferLike | undefined>(typedStorage.getBuffer('someBuffer'));

// Utility operations
expectType<(keyof TestStorageValues)[]>(typedStorage.getAllKeys());
expectType<boolean>(typedStorage.contains('someString'));
typedStorage.addOnValueChangedListener((key) => {
  expectType<keyof TestStorageValues>(key);
});
nonTypedStorage.addOnValueChangedListener((key) => {
  expectType<string>(key);
});

// Invalid type usages (should cause TypeScript errors)

// Invalid key tests
expectError(typedStorage.set('fooBar', 'someString'));
expectError(typedStorage.delete('fooBar'));
expectError(typedStorage.contains('fooBar'));
expectError(typedStorage.getString('fooBar'));
expectError(typedStorage.getNumber('fooBar'));
expectError(typedStorage.getBoolean('fooBar'));
expectError(typedStorage.getBuffer('fooBar'));

// Invalid value type tests
expectError(typedStorage.set('someString', 123));
expectError(typedStorage.set('someNumber', '123'));
expectError(typedStorage.set('someBoolean', 123));
expectError(typedStorage.set('someBuffer', '123'));

// Invalid method for key type tests
expectError(typedStorage.getString('someBoolean'));
expectError(typedStorage.getBoolean('someString'));
expectError(typedStorage.getNumber('someBoolean'));
expectError(typedStorage.getBuffer('someString'));

// ===== Hooks Tests =====

// useMMKV hook tests
const localTypedStorage = useMMKV<TestStorageValues>();
expectType<void>(localTypedStorage.set('someString', 'some-token'));
expectType<string | undefined>(localTypedStorage.getString('someString'));
expectType<(keyof TestStorageValues)[]>(localTypedStorage.getAllKeys());

// Valid hook usages

// String hook
const [someString, setSomeString] = useMMKVString('someString', typedStorage);
expectType<string | undefined>(someString);
expectType<void>(setSomeString('some-token'));

// Number hook
const [someNumber, setSomeNumber] = useMMKVNumber('someNumber', typedStorage);
expectType<number | undefined>(someNumber);
expectType<void>(setSomeNumber(1));

// Boolean hook
const [someBoolean, setSomeBoolean] = useMMKVBoolean(
  'someBoolean',
  typedStorage
);
expectType<boolean | undefined>(someBoolean);
expectType<void>(setSomeBoolean(true));

// Buffer hook
const [someBuffer, setSomeBuffer] = useMMKVBuffer('someBuffer', typedStorage);
expectType<ArrayBufferLike | undefined>(someBuffer);
expectType<void>(setSomeBuffer(new ArrayBuffer(10)));

// Object hook
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

// Invalid hook usages

// Invalid key for hook type tests
expectError(useMMKVString('someBoolean', typedStorage));
expectError(useMMKVNumber('someString', typedStorage));
expectError(useMMKVBoolean('someNumber', typedStorage));
expectError(useMMKVBuffer('someString', typedStorage));

// Invalid setter value type tests
expectError(setSomeString(1));
expectError(setSomeNumber('1'));
expectError(setSomeBoolean(1));
expectError(setSomeBuffer('1'));

// Non-existent key tests
expectError(useMMKVString('someOtherKey', typedStorage));
expectError(useMMKVNumber('someOtherKey', typedStorage));
expectError(useMMKVBoolean('someOtherKey', typedStorage));
expectError(useMMKVBuffer('someOtherKey', typedStorage));
